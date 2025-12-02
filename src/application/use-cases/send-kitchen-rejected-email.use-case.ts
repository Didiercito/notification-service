import { IEmailService } from '../../domain/interfaces/IEmailService';
import { IEmailLogRepository } from '../../domain/interfaces/IEmailLogRepository';
import { KitchenRejectedEventDto } from '../dto/kitchen-rejected-event.dto';
import { EmailLog, LogStatus } from '../../domain/entitie/email-log.entity';
import { loadTemplate } from '../utils/template.helper';

export class SendKitchenRejectedEmailUseCase {
  constructor(
    private readonly emailService: IEmailService,
    private readonly emailLogRepository: IEmailLogRepository
  ) {}

  async execute(event: KitchenRejectedEventDto): Promise<void> {
    const subject = `Tu solicitud de cocina fue rechazada`;
    let status = LogStatus.SENT;
    let errorMessage: string | null = null;

    try {
      const htmlContent = await loadTemplate('kitchen_rejected.html', {
        kitchenName: event.kitchenName,
        userName: event.fullName,
        rejectionReason: event.rejectionReason,
      });

      await this.emailService.sendEmail({
        recipient: event.email,
        subject,
        htmlBody: htmlContent,
      });

      console.log(`📧 Email de rechazo enviado correctamente a: ${event.email}`);
    } catch (err: any) {
      console.error('❌ Error enviando correo de rechazo:', err);
      status = LogStatus.FAILED;
      errorMessage = err.message || 'Unknown error';
    } finally {
      const log = new EmailLog(
        0,
        event.email,
        subject,
        status,
        new Date(),
        'SendGrid',
        errorMessage
      );

      await this.emailLogRepository.save(log);
    }
  }
}
