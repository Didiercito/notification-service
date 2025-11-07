import { PasswordResetEventDto } from '../dto/password-reset-event.dto';
import { IEmailService } from '../../domain/interfaces/IEmailService';
import { IEmailLogRepository } from '../../domain/interfaces/IEmailLogRepository';
import { EmailLog, LogStatus } from '../../domain/entitie/email-log.entity';
import { loadTemplate } from '../utils/template.helper';

export class SendPasswordResetEmailUseCase {
  constructor(
    private readonly emailService: IEmailService,
    private readonly emailLogRepository: IEmailLogRepository
  ) {}

  async execute(dto: PasswordResetEventDto): Promise<void> {
    const subject = 'Restablece tu contraseña de Chambealo';
    let logStatus = LogStatus.SENT;
    let errorMsg: string | null = null;

    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${dto.resetToken}`;

      const htmlBody = await loadTemplate('password-reset.template.html', {
        resetUrl: resetUrl,
      });

      await this.emailService.sendEmail({
        recipient: dto.email,
        subject,
        htmlBody,
      });
    } catch (error: any) {
      console.error('Error al enviar email de reseteo:', error);
      logStatus = LogStatus.FAILED;
      errorMsg = error.message;
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