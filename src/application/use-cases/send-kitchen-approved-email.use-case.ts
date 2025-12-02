import { IEmailService } from '../../domain/interfaces/IEmailService';
import { IEmailLogRepository } from '../../domain/interfaces/IEmailLogRepository';
import { KitchenApprovedEventDto } from '../dto/kitchen-approved-event.dto';
import { EmailLog, LogStatus } from '../../domain/entitie/email-log.entity';
import { loadTemplate } from '../utils/template.helper';

export class SendKitchenApprovedEmailUseCase {
  constructor(
    private readonly emailService: IEmailService,
    private readonly emailLogRepository: IEmailLogRepository
  ) {}

  async execute(event: KitchenApprovedEventDto): Promise<void> {
    const subject = '¡Tu cocina ha sido aprobada!';
    let logStatus = LogStatus.SENT;
    let errorMsg: string | null = null;

    try {
      const variables = {
        userName: event.fullName,
        kitchenName: event.kitchenName
      };

      const htmlBody = await loadTemplate('kitchen_approved.html', variables);

      await this.emailService.sendEmail({
        recipient: event.email,
        subject,
        htmlBody,
      });

      console.log(`✅ Email de aprobación enviado a: ${event.email}`);
    } catch (error: any) {
      console.error('❌ Error al enviar correo de aprobación de cocina:', error);
      logStatus = LogStatus.FAILED;
      errorMsg = error.message;
    } finally {
      const emailLog = new EmailLog(
        0,
        event.email,
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