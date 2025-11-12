// Path: didiercito-notification-service/src/infracstructure/api/dependencies/dependencies.ts

import { IEmailService } from '../../../domain/interfaces/IEmailService';
import { IEmailLogRepository } from '../../../domain/interfaces/IEmailLogRepository';
import { ISMSService } from '../../../domain/interfaces/ISMSService';

import { EmailLogAdapter } from '../../adapters/email-log.adapter';
import { SendGridEmailAdapter } from '../../adapters/sendgrid-email.adapter';
import { TwilioSmsAdapter } from '../../adapters/twilio-sms.adapter';
import { RabbitMQConsumer } from '../../adapters/rabbitmq.consumer';
import { HealthController } from '../controllers/health.controller';

// NUEVOS IMPORTS Y ADAPTADORES
import axios, { AxiosInstance } from 'axios';
import { AuthServiceUserRepository } from '../../adapters/auth-service-user-repository.adapter'; 
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';

import { SendWelcomeEmailUseCase } from '../../../application/use-cases/send-welcome-email.use-case';
import { SendVerificationEmailUseCase } from '../../../application/use-cases/send-verification-email.use-case';
import { SendPasswordResetEmailUseCase } from '../../../application/use-cases/send-password-reset-email.use-case';
import { SendVerificationSMSUseCase } from '../../../application/use-cases/send-verification-sms.use-case';
import { SendKitchenPendingEmailUseCase } from '../../../application/use-cases/send-kitchen-pending-email.use-case';
import { SendWelcomeKitchenAdminEmailUseCase } from '../../../application/use-cases/send-welcome-kitchen-admin-email.use-case';
import { SendKitchenRejectedEmailUseCase } from '../../../application/use-cases/send-kitchen-rejected-email.use-case';
import { SendKitchenApprovedEmailUseCase } from '../../../application/use-cases/send-kitchen-approved-email.use-case';

const emailLogRepository: IEmailLogRepository = new EmailLogAdapter();
const emailService: IEmailService = new SendGridEmailAdapter();
const smsService: ISMSService = new TwilioSmsAdapter();

// CONFIGURACIÓN DEL CLIENTE HTTP PARA EL AUTH SERVICE
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const AXIOS_CLIENT: AxiosInstance = axios.create({
  baseURL: AUTH_SERVICE_URL,
  timeout: 10000, 
});

// ADAPTADOR/GATEWAY PARA OBTENER DATOS DE USUARIO
const userRepository: IUserRepository = new AuthServiceUserRepository(AXIOS_CLIENT); 

// CASOS DE USO (Todos los use cases nuevos requieren userRepository)
const sendWelcomeEmailUseCase = new SendWelcomeEmailUseCase(emailService, emailLogRepository);
const sendVerificationEmailUseCase = new SendVerificationEmailUseCase(emailService, emailLogRepository);
const sendPasswordResetEmailUseCase = new SendPasswordResetEmailUseCase(emailService, emailLogRepository);
const sendVerificationSMSUseCase = new SendVerificationSMSUseCase(smsService, emailLogRepository);

// Asumo que este CU también necesita el userRepository si va a usar datos de la cocina pendiente
const sendKitchenPendingEmailUseCase = new SendKitchenPendingEmailUseCase(
  emailService, 
  emailLogRepository
);

const sendWelcomeKitchenAdminEmailUseCase = new SendWelcomeKitchenAdminEmailUseCase(
  emailService, 
  emailLogRepository
);

// Casos de uso de Aprobación y Rechazo (inyectan userRepository)
const sendKitchenApprovedEmailUseCase = new SendKitchenApprovedEmailUseCase(
  emailService,
  emailLogRepository,
  userRepository
); 

const sendKitchenRejectedEmailUseCase = new SendKitchenRejectedEmailUseCase(
  emailService,
  emailLogRepository,
  userRepository
);

// CONEXIÓN DEL CONSUMER
const rabbitMqConsumer = new RabbitMQConsumer(
  sendWelcomeEmailUseCase,
  sendVerificationEmailUseCase,
  sendPasswordResetEmailUseCase,
  sendVerificationSMSUseCase,
  sendKitchenPendingEmailUseCase,
  sendWelcomeKitchenAdminEmailUseCase,
  sendKitchenRejectedEmailUseCase,
  sendKitchenApprovedEmailUseCase // <<-- AÑADIDO PARA LA INYECCIÓN
);

const healthController = new HealthController();

// EXPORTS
export {
  healthController,
  rabbitMqConsumer,
  sendWelcomeEmailUseCase,
  sendVerificationEmailUseCase,
  sendPasswordResetEmailUseCase,
  sendVerificationSMSUseCase,
  sendKitchenPendingEmailUseCase,
  sendWelcomeKitchenAdminEmailUseCase,
  sendKitchenRejectedEmailUseCase,
  sendKitchenApprovedEmailUseCase 
};