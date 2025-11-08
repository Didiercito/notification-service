import { IEmailService } from '../../domain/interfaces/IEmailService';
import { IEmailLogRepository } from '../../domain/interfaces/IEmailLogRepository';
import { KitchenPendingEventDto } from '../dto/kitchen-pending-event.dto';
import { EmailLog, LogStatus } from '../../domain/entitie/email-log.entity';
import { loadTemplate } from '../utils/template.helper';

export class SendKitchenPendingEmailUseCase {
  constructor(
    private readonly emailService: IEmailService,
    private readonly emailLogRepository: IEmailLogRepository
  ) {}

  async execute(eventData: KitchenPendingEventDto): Promise<void> {
    const { userData, kitchenData } = eventData;
    const subject = 'Tu solicitud de cocina está en revisión';
    let logStatus = LogStatus.SENT;
    let errorMsg: string | null = null;

    try {
      const variables = {
        userName: userData.names,
        kitchenName: kitchenData.name
      };

      const htmlBody = await loadTemplate('kitchen_pending.html', variables);

      await this.emailService.sendEmail({
        recipient: userData.email,
        subject: subject,
        htmlBody: htmlBody,
      });

      console.log(`✅ Email de "cocina en revisión" enviado a: ${userData.email}`);

    } catch (error: any) {
      console.error('❌ Error enviando email de "cocina en revisión":', error);
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