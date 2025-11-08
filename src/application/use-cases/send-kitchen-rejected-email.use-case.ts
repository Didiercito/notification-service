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

  async execute(eventData: KitchenRejectedEventDto): Promise<void> {
    const { userData, kitchenData, rejectionReason } = eventData;
    const subject = 'Actualización sobre tu solicitud de cocina';
    let logStatus = LogStatus.SENT;
    let errorMsg: string | null = null;

    try {
      const variables = {
        userName: userData.names,
        kitchenName: kitchenData.name,
        rejectionReason: rejectionReason
      };

      const htmlBody = await loadTemplate('kitchen_rejected.html', variables);

      await this.emailService.sendEmail({
        recipient: userData.email,
        subject: subject,
        htmlBody: htmlBody,
      });

      console.log(`✅ Email de "cocina rechazada" enviado a: ${userData.email}`);

    } catch (error: any) {
      console.error('❌ Error enviando email de "cocina rechazada":', error);
      logStatus = LogStatus.FAILED;
      errorMsg = error.message || 'Unknown error';
    } finally {
      const emailLog = new EmailLog(
        0,
        userData.email,
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