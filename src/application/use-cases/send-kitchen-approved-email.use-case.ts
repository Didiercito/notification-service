import { KitchenApprovedEventDto } from '../dto/kitchen-approved-event.dto';
import { IEmailService } from '../../domain/interfaces/IEmailService';
import { IEmailLogRepository } from '../../domain/interfaces/IEmailLogRepository';
import { EmailLog, LogStatus } from '../../domain/entitie/email-log.entity';
import { loadTemplate } from '../utils/template.helper';

export class SendKitchenApprovedEmailUseCase {
  constructor(
    private readonly emailService: IEmailService,
    private readonly emailLogRepository: IEmailLogRepository
  ) {}

  async execute(dto: KitchenApprovedEventDto): Promise<void> {
    const subject = '🎉 ¡Tu cocina ha sido aprobada!';
    let logStatus = LogStatus.SENT;
    let errorMsg: string | null = null;

    try {
      const htmlBody = await loadTemplate('kitchen_approved.html', {
        kitchenName: dto.kitchenName,
      });

      await this.emailService.sendEmail({
        recipient: dto.email,
        subject,
        htmlBody,
      });

      console.log(`✅ Email de aprobación de cocina enviado a: ${dto.email}`);
    } catch (error: any) {
      console.error('❌ Error enviando email de aprobación de cocina:', error);
      logStatus = LogStatus.FAILED;
      errorMsg = error.message || 'Unknown error';
    } finally {
      const emailLog = new EmailLog(
        0,
        dto.email,
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
