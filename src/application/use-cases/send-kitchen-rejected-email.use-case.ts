import { IEmailService } from '../../domain/interfaces/IEmailService';
import { IEmailLogRepository } from '../../domain/interfaces/IEmailLogRepository';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { KitchenRejectedEventDto } from '../dto/kitchen-rejected-event.dto';
import { EmailLog, LogStatus } from '../../domain/entitie/email-log.entity';
import { loadTemplate } from '../utils/template.helper';

export class SendKitchenRejectedEmailUseCase {
  constructor(
    private readonly emailService: IEmailService,
    private readonly emailLogRepository: IEmailLogRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(event: KitchenRejectedEventDto): Promise<void> {
    try {
      const user = await this.userRepository.getUserById(Number(event.ownerId));

      if (!user) {
        console.error(`❌ Usuario con ID ${event.ownerId} no encontrado.`);
        return;
      }

      const subject = 'Tu solicitud de cocina fue rechazada';
      let logStatus = LogStatus.SENT;
      let errorMsg: string | null = null;

      try {
        const htmlBody = await loadTemplate('kitchen_rejected.html', {
          userName: user.names,
          kitchenName: event.kitchenName,
          rejectionReason: event.rejectionReason || 'No se especificó la razón',
        });

        await this.emailService.sendEmail({
          recipient: user.email,
          subject,
          htmlBody,
        });

        console.log(`✅ Email de rechazo enviado a: ${user.email}`);
      } catch (error: any) {
        console.error('❌ Error al enviar correo de rechazo:', error);
        logStatus = LogStatus.FAILED;
        errorMsg = error.message || 'Unknown error';
      } finally {
        const emailLog = new EmailLog(
          0,
          user.email,
          subject,
          logStatus,
          new Date(),
          'SendGrid',
          errorMsg
        );

        await this.emailLogRepository.save(emailLog);
      }
    } catch (error) {
      console.error('❌ Error general en SendKitchenRejectedEmailUseCase:', error);
    }
  }
}
