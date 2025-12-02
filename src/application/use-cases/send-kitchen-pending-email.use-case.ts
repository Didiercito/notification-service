import { IEmailService } from '../../domain/interfaces/IEmailService';
import { IEmailLogRepository } from '../../domain/interfaces/IEmailLogRepository';
import { KitchenPendingEventDto } from '../dto/kitchen-pending-event.dto';
import { EmailLog, LogStatus } from '../../domain/entitie/email-log.entity';
import { loadTemplate } from '../utils/template.helper';

export class SendKitchenPendingEmailUseCase {
  constructor(
    private readonly emailService: IEmailService,
    private readonly emailLogRepository: IEmailLogRepository,
  ) {}

  async execute(event: KitchenPendingEventDto): Promise<void> {
    const subject = 'Solicitud de cocina recibida';
    let logStatus = LogStatus.SENT;
    let errorMsg: string | null = null;

    try {
      console.log(`[📬] Procesando evento de cocina pendiente:`, event);

      const variables = {
        userName: event.fullName,
        kitchenName: event.kitchenName,
      };

      const htmlBody = await loadTemplate('kitchen_pending.html', variables);

      await this.emailService.sendEmail({
        recipient: event.email,
        subject,
        htmlBody,
      });

      console.log(`✅ Email de cocina pendiente enviado a: ${event.email}`);
    } catch (error: any) {
      console.error('❌ Error al enviar correo de cocina pendiente:', error);
      logStatus = LogStatus.FAILED;
      errorMsg = error.message || 'Unknown error';
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