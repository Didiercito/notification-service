import { IEmailService } from '../../domain/interfaces/IEmailService';
import { IEmailLogRepository } from '../../domain/interfaces/IEmailLogRepository';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { KitchenPendingEventDto } from '../dto/kitchen-pending-event.dto';
import { EmailLog, LogStatus } from '../../domain/entitie/email-log.entity';
import { loadTemplate } from '../utils/template.helper';

export class SendKitchenPendingEmailUseCase {
  constructor(
    private readonly emailService: IEmailService,
    private readonly emailLogRepository: IEmailLogRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(event: KitchenPendingEventDto): Promise<void> {
    const user = await this.userRepository.getUserById(event.userId);

    if (!user) {
      throw new Error(`User with id ${event.userId} not found`);
    }

    const subject = 'Tu solicitud de cocina está en revisión';
    let logStatus = LogStatus.SENT;
    let errorMsg: string | null = null;

    try {
      const htmlBody = await loadTemplate('kitchen_pending.html', {
        userName: user.names,
        kitchenName: event.kitchenName,
      });

      await this.emailService.sendEmail({
        recipient: user.email,
        subject,
        htmlBody,
      });

      console.log(`✅ Email de "cocina en revisión" enviado a: ${user.email}`);
    } catch (error: any) {
      console.error('❌ Error enviando email de "cocina en revisión":', error);
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
  }
}
