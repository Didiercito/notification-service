import { IEmailService } from '../../../domain/interfaces/IEmailService';
import { IEmailLogRepository } from '../../../domain/interfaces/IEmailLogRepository';
// import { ISMSService } from '../../../domain/interfaces/ISMSService';

import { EmailLogAdapter } from '../../adapters/email-log.adapter';
import { SendGridEmailAdapter } from '../../adapters/sendgrid-email.adapter';
// import { TwilioSmsAdapter } from '../../adapters/twilio-sms.adapter';
import { RabbitMQConsumer } from '../../adapters/rabbitmq.consumer';

import { SendWelcomeEmailUseCase } from '../../../application/use-cases/send-welcome-email.use-case';
import { SendVerificationEmailUseCase } from '../../../application/use-cases/send-verification-email.use-case';
import { SendPasswordResetEmailUseCase } from '../../../application/use-cases/send-password-reset-email.use-case';
// import { SendVerificationSMSUseCase } from '../../../application/use-cases/send-verification-sms.use-case'; 

import { HealthController } from '../controllers/health.controller';

const emailLogRepository: IEmailLogRepository = new EmailLogAdapter();
const emailService: IEmailService = new SendGridEmailAdapter();
// const smsService: ISMSService = new TwilioSmsAdapter();

const sendWelcomeEmailUseCase = new SendWelcomeEmailUseCase(
  emailService,
  emailLogRepository
);

const sendVerificationEmailUseCase = new SendVerificationEmailUseCase(
  emailService,
  emailLogRepository
);

const sendPasswordResetEmailUseCase = new SendPasswordResetEmailUseCase(
  emailService,
  emailLogRepository
);

// const sendVerificationSMSUseCase = new SendVerificationSMSUseCase(
//   smsService,
//   emailLogRepository
// );

const rabbitMqConsumer = new RabbitMQConsumer(
  sendWelcomeEmailUseCase,
  sendVerificationEmailUseCase,
  sendPasswordResetEmailUseCase
);

const healthController = new HealthController();

export {
  healthController,
  rabbitMqConsumer,
  sendWelcomeEmailUseCase,
  sendVerificationEmailUseCase,
  sendPasswordResetEmailUseCase,
  // sendVerificationSMSUseCase,
};
