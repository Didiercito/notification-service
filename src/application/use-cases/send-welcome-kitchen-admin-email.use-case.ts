import { IEmailService } from '../../domain/interfaces/IEmailService';
import { IEmailLogRepository } from '../../domain/interfaces/IEmailLogRepository';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { KitchenAdminRegisteredEventDto } from '../dto/kitchen-admin-registered-event.dto';
import { EmailLog, LogStatus } from '../../domain/entitie/email-log.entity';
import { loadTemplate } from '../utils/template.helper';

export class SendWelcomeKitchenAdminEmailUseCase {
  constructor(
    private readonly emailService: IEmailService,
    private readonly emailLogRepository: IEmailLogRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(eventData: KitchenAdminRegisteredEventDto): Promise<void> {
    const { userId, kitchenData } = eventData;
    const subject = '¡Bienvenido a Chambealo - Registro de Cocina Comunitaria!';
    let logStatus = LogStatus.SENT;
    let errorMsg: string | null = null;

    try {
      // 🔍 Obtener usuario desde el Auth Service
      const user = await this.userRepository.getUserById(userId);

      // ⚠️ Validar si no existe
      if (!user) {
        console.warn(`⚠️ Usuario con ID ${userId} no encontrado. No se enviará correo.`);
        return;
      }

      // 🧩 Construir nombre completo
      const fullName = `${user.names ?? ''} ${user.firstLastName ?? ''} ${user.secondLastName ?? ''}`.trim();

      // 🌐 Variables para el template
      const variables = {
        userName: fullName,
        kitchenName: kitchenData.name,
        dashboardUrl: process.env.KITCHEN_ADMIN_FRONTEND_URL || 'https://tu-app.com/login',
      };

      // 📄 Cargar plantilla HTML
      const htmlBody = await loadTemplate('welcome_admin_kitchen.html', variables);

      // ✉️ Enviar correo
      await this.emailService.sendEmail({
        recipient: user.email,
        subject,
        htmlBody,
      });

      console.log(`✅ Email de bienvenida a admin de cocina enviado a: ${user.email}`);

    } catch (error: any) {
      console.error('❌ Error enviando email de bienvenida a admin de cocina:', error);
      logStatus = LogStatus.FAILED;
      errorMsg = error.message || 'Unknown error';
    } finally {
      // 🧾 Guardar log del envío
      const email = eventData.userData?.email || 'unknown';
      const emailLog = new EmailLog(
        0,
        email,
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
