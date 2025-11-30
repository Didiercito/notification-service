import { EmailVerificationEventDto } from '../dto/email-verification-event.dto';
import { IEmailService } from '../../domain/interfaces/IEmailService';
import { IEmailLogRepository } from '../../domain/interfaces/IEmailLogRepository';
import { EmailLog, LogStatus } from '../../domain/entitie/email-log.entity';
import { loadTemplate } from '../utils/template.helper';

export class SendVerificationEmailUseCase {
  constructor(
    private readonly emailService: IEmailService,
    private readonly emailLogRepository: IEmailLogRepository
  ) {}

  async execute(dto: EmailVerificationEventDto): Promise<void> {
    const subject = 'Verifica tu cuenta de Bienestar Integral';

    let logStatus = LogStatus.SENT;
    let errorMsg: string | null = null;

    try {
      const htmlBody = await loadTemplate('verification.template.html', {
        userName: dto.userName,
        verificationUrl: dto.verificationUrl,
      });

      await this.emailService.sendEmail({
        recipient: dto.email,
        subject,
        htmlBody,
      });

    } catch (error: any) {
      console.error('Error al enviar email de verificación:', error);
      logStatus = LogStatus.FAILED;
      errorMsg = error.message;

    } finally {
      await this.emailLogRepository.save(
        new EmailLog(
          0,
          dto.email,
          subject,
          logStatus,
          new Date(),
          'SendGrid',
          errorMsg
        )
      );
    }
  }
}