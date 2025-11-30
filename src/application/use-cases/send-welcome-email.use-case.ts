import { UserRegisteredEventDto } from '../dto/user-registered-event.dto';
import { IEmailService } from '../../domain/interfaces/IEmailService';
import { IEmailLogRepository } from '../../domain/interfaces/IEmailLogRepository';
import { EmailLog, LogStatus } from '../../domain/entitie/email-log.entity';
import { loadTemplate } from '../utils/template.helper';

export class SendWelcomeEmailUseCase {
  constructor(
    private readonly emailService: IEmailService,
    private readonly emailLogRepository: IEmailLogRepository
  ) {}

  async execute(dto: UserRegisteredEventDto): Promise<void> {
    const subject = '¡Bienvenido a Bienestar Integral!';
    let logStatus = LogStatus.SENT;
    let errorMsg: string | null = null;

    try {
      // 🔥 Cargar plantilla e insertar variables
      const htmlBody = await loadTemplate('welcome.template.html', {
        userName: dto.names,
      });

      // 🔥 Usar EXACTAMENTE las propiedades que requiere tu interfaz
      await this.emailService.sendEmail({
        recipient: dto.email,
        subject,
        htmlBody,
      });

    } catch (error: any) {
      console.error('❌ Error al enviar email de bienvenida:', error);

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