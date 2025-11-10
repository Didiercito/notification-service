import { IEmailService } from '../../domain/interfaces/IEmailService';
import { IEmailLogRepository } from '../../domain/interfaces/IEmailLogRepository';
import { KitchenAdminRegisteredEventDto } from '../dto/kitchen-admin-registered-event.dto';
import { EmailLog, LogStatus } from '../../domain/entitie/email-log.entity';
import { loadTemplate } from '../utils/template.helper';

export class SendWelcomeKitchenAdminEmailUseCase {
  constructor(
    private readonly emailService: IEmailService,
    private readonly emailLogRepository: IEmailLogRepository
  ) {}

  async execute(eventData: KitchenAdminRegisteredEventDto): Promise<void> {
    const { userData } = eventData; 
    const subject = '¡Bienvenido a Chambealo - Registro de Cocina Comunitaria!';
    let logStatus = LogStatus.SENT;
    let errorMsg: string | null = null;

    try {
      const fullName = `${userData.names} ${userData.firstLastName} ${userData.secondLastName}`;

      const variables = {
        userName: fullName,
        dashboardUrl: process.env.KITCHEN_ADMIN_FRONTEND_URL || 'https://tu-app.com/login' // Debes añadir esta URL a tu .env
      };

      const htmlBody = await loadTemplate('welcome_admin_kitchen.html', variables);

      await this.emailService.sendEmail({
        recipient: userData.email,
        subject: subject,
        htmlBody: htmlBody,
      });

      console.log(`✅ Email de bienvenida para admin de cocina enviado a: ${userData.email}`);

    } catch (error: any) {
      console.error('❌ Error enviando email de bienvenida a admin de cocina:', error);
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