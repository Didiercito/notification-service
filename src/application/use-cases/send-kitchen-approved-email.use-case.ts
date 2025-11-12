import { IEmailService } from '../../domain/interfaces/IEmailService';
import { IEmailLogRepository } from '../../domain/interfaces/IEmailLogRepository';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { KitchenApprovedEventDto } from '../dto/kitchen-approved-event.dto';
import { EmailLog, LogStatus } from '../../domain/entitie/email-log.entity';
import { loadTemplate } from '../utils/template.helper';

export class SendKitchenApprovedEmailUseCase {
  constructor(
    private readonly emailService: IEmailService,
    private readonly emailLogRepository: IEmailLogRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(event: KitchenApprovedEventDto): Promise<void> {
    const subject = '¡Tu cocina ha sido aprobada!';
    let logStatus = LogStatus.SENT;
    let errorMsg: string | null = null;

    try {
      console.log(`[📬] Procesando evento de aprobación de cocina ID=${event.kitchenId}`);

      const owner = await this.userRepository.getUserById(event.ownerId);

      if (!owner) {
        throw new Error(`No se encontró el usuario con ID=${event.ownerId}`);
      }

      const variables = {
        userName: owner.names,
        kitchenName: event.kitchenName,
      };

      const htmlBody = await loadTemplate('kitchen_approved.html', variables);

      await this.emailService.sendEmail({
        recipient: owner.email,
        subject,
        htmlBody,
      });

      console.log(`✅ Email de aprobación enviado a: ${owner.email}`);
    } catch (error: any) {
      console.error('❌ Error al enviar correo de aprobación de cocina:', error);
      logStatus = LogStatus.FAILED;
      errorMsg = error.message || 'Unknown error';
    } finally {
      const emailLog = new EmailLog(
        0,
        event.ownerId.toString(), 
        subject,
        logStatus,
        new Date(),
        'SendGrid',
        errorMsg
      );
      await this.emailLogRepository.save(emailLog);
    }
  }
}
