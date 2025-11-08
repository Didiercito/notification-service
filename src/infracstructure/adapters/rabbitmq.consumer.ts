import * as amqp from 'amqplib';
import { Connection, Channel, ConsumeMessage } from 'amqplib';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UserRegisteredEventDto } from '../../application/dto/user-registered-event.dto';
import { EmailVerificationEventDto } from '../../application/dto/email-verification-event.dto';
import { PasswordResetEventDto } from '../../application/dto/password-reset-event.dto';
import { SendWelcomeEmailUseCase } from '../../application/use-cases/send-welcome-email.use-case';
import { SendVerificationEmailUseCase } from '../../application/use-cases/send-verification-email.use-case';
import { SendPasswordResetEmailUseCase } from '../../application/use-cases/send-password-reset-email.use-case';
import { SendVerificationSMSUseCase } from '../../application/use-cases/send-verification-sms.use-case';

import { KitchenPendingEventDto } from '../../application/dto/kitchen-pending-event.dto';
import { KitchenRejectedEventDto } from '../../application/dto/kitchen-rejected-event.dto';
import { SendKitchenPendingEmailUseCase } from '../../application/use-cases/send-kitchen-pending-email.use-case';
import { SendKitchenRejectedEmailUseCase } from '../../application/use-cases/send-kitchen-rejected-email.use-case';
import { SendWelcomeKitchenAdminEmailUseCase } from '../../application/use-cases/send-welcome-kitchen-admin-email.use-case';
import { KitchenAdminRegisteredEventDto } from '../../application/dto/kitchen-admin-registered-event.dto';


const EXCHANGE_NAME = process.env.RABBITMQ_EXCHANGE;
const QUEUE_NAME = 'notification_queue'; 

const ROUTING_KEYS = {
  USER_REGISTERED: 'user.registered',
  USER_EMAIL_VERIFICATION_RESENT: 'user.email.verification.resent',
  USER_PASSWORD_RESET_REQUESTED: 'user.password.reset.requested',
  USER_PHONE_VERIFICATION_RESENT: 'user.phone.verification.resent',
  
  KITCHEN_ADMIN_REGISTERED: 'kitchen.admin.registered',
  KITCHEN_APPROVED: 'kitchen.approved',
  KITCHEN_REJECTED: 'kitchen.rejected'
};

export class RabbitMQConsumer {
  private connection!: Connection;
  private channel!: Channel;

  constructor(
    private readonly sendWelcomeEmailUseCase: SendWelcomeEmailUseCase,
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
    private readonly sendPasswordResetEmailUseCase: SendPasswordResetEmailUseCase,
    private readonly sendVerificationSMSUseCase: SendVerificationSMSUseCase,
    private readonly sendKitchenPendingEmailUseCase: SendKitchenPendingEmailUseCase,
    private readonly sendWelcomeKitchenAdminEmailUseCase: SendWelcomeKitchenAdminEmailUseCase,
    private readonly sendKitchenRejectedEmailUseCase: SendKitchenRejectedEmailUseCase
  ) {}

  async connect(): Promise<void> {
    const url = process.env.RABBITMQ_URL;
    if (!url || !EXCHANGE_NAME) {
      throw new Error('RABBITMQ_URL y RABBITMQ_EXCHANGE deben estar definidos en .env');
    }

    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
    await this.channel.assertQueue(QUEUE_NAME, { durable: true });

    for (const key of Object.values(ROUTING_KEYS)) {
      await this.channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, key);
    }

    console.log('✅ RabbitMQ conectado y escuchando eventos...');
  }

  async startConsuming(): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    console.log(`[*] Esperando mensajes en la cola: ${QUEUE_NAME}.`);
    this.channel.consume(QUEUE_NAME, async (msg: ConsumeMessage | null) => {
      if (msg) {
        try {
          await this.handleMessage(msg);
          this.channel.ack(msg);
        } catch (err) {
          console.error('Error al procesar mensaje:', err);
          this.channel.nack(msg);
        }
      }
    });
  }

  private async handleMessage(msg: ConsumeMessage): Promise<void> {
    const routingKey = msg.fields.routingKey;
    const content = JSON.parse(msg.content.toString());
    console.log(`[📥] Mensaje recibido. Key: ${routingKey}`);

    switch (routingKey) {
      
      case ROUTING_KEYS.USER_REGISTERED:
        const userDto = plainToInstance(UserRegisteredEventDto, content);
        await this.validateDto(userDto);
        await this.sendWelcomeEmailUseCase.execute(userDto);
        break;

      case ROUTING_KEYS.USER_EMAIL_VERIFICATION_RESENT:
        const verificationDto = plainToInstance(EmailVerificationEventDto, content);
        await this.validateDto(verificationDto);
        await this.sendVerificationEmailUseCase.execute(verificationDto);
        break;

      case ROUTING_KEYS.USER_PASSWORD_RESET_REQUESTED:
        const resetDto = plainToInstance(PasswordResetEventDto, content);
        await this.validateDto(resetDto);
        await this.sendPasswordResetEmailUseCase.execute(resetDto);
        break;

      case ROUTING_KEYS.USER_PHONE_VERIFICATION_RESENT:
        const { phoneNumber, verificationCode } = content;
        if (!phoneNumber || !verificationCode) {
          throw new Error('Datos del evento de verificación de teléfono inválidos.');
        }
        await this.sendVerificationSMSUseCase.execute(phoneNumber, verificationCode);
        break;

      case ROUTING_KEYS.KITCHEN_ADMIN_REGISTERED:
        const pendingDto = plainToInstance(KitchenPendingEventDto, content);
        await this.validateDto(pendingDto);
        await this.sendKitchenPendingEmailUseCase.execute(pendingDto);
        break;

      case ROUTING_KEYS.KITCHEN_APPROVED:
        const approvedDto = plainToInstance(KitchenAdminRegisteredEventDto, content); 
        await this.validateDto(approvedDto);
        await this.sendWelcomeKitchenAdminEmailUseCase.execute(approvedDto);
        break;

      case ROUTING_KEYS.KITCHEN_REJECTED:
        const rejectedDto = plainToInstance(KitchenRejectedEventDto, content);
        await this.validateDto(rejectedDto);
        await this.sendKitchenRejectedEmailUseCase.execute(rejectedDto);
        break;

      default:
        console.warn(`Routing key no reconocido: ${routingKey}`);
    }
  }

  private async validateDto(dto: object): Promise<void> {
    const errors = await validate(dto);
    if (errors.length > 0) {
      console.error('DTO de evento inválido:', errors);
      throw new Error('Datos del evento inválidos.');
    }
  }
}