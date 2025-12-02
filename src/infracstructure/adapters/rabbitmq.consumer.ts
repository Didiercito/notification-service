import * as amqp from 'amqplib';
import { Connection, Channel, ConsumeMessage } from 'amqplib';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UserRegisteredEventDto } from '../../application/dto/user-registered-event.dto';
import { EmailVerificationEventDto } from '../../application/dto/email-verification-event.dto';
import { PasswordResetEventDto } from '../../application/dto/password-reset-event.dto';
import { KitchenPendingEventDto } from '../../application/dto/kitchen-pending-event.dto';
import { KitchenRejectedEventDto } from '../../application/dto/kitchen-rejected-event.dto';
import { KitchenApprovedEventDto } from '../../application/dto/kitchen-approved-event.dto';

import { SendWelcomeEmailUseCase } from '../../application/use-cases/send-welcome-email.use-case';
import { SendVerificationEmailUseCase } from '../../application/use-cases/send-verification-email.use-case';
import { SendPasswordResetEmailUseCase } from '../../application/use-cases/send-password-reset-email.use-case';
import { SendVerificationSMSUseCase } from '../../application/use-cases/send-verification-sms.use-case';
import { SendKitchenPendingEmailUseCase } from '../../application/use-cases/send-kitchen-pending-email.use-case';
import { SendKitchenRejectedEmailUseCase } from '../../application/use-cases/send-kitchen-rejected-email.use-case';
import { SendKitchenApprovedEmailUseCase } from '../../application/use-cases/send-kitchen-approved-email.use-case';

const EXCHANGE_NAME = process.env.RABBITMQ_EXCHANGE;
const QUEUE_NAME = process.env.RABBITMQ_QUEUE_NOTIFICATIONS || '';

const ROUTING_KEYS = {
  USER_REGISTERED: 'user.registered',
  USER_EMAIL_VERIFICATION_RESENT: 'user.email.verification.resent',
  USER_PASSWORD_RESET_REQUESTED: 'user.password.reset.requested',
  USER_PHONE_VERIFICATION_RESENT: 'user.phone.verification.resent',

  KITCHEN_PENDING: 'kitchen.pending',
  KITCHEN_APPROVED: 'kitchen.approved',
  KITCHEN_REJECTED: 'kitchen.rejected',
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
    private readonly sendKitchenRejectedEmailUseCase: SendKitchenRejectedEmailUseCase,
    private readonly sendKitchenApprovedEmailUseCase: SendKitchenApprovedEmailUseCase,
  ) {}

  async connect(): Promise<void> {
    const url = process.env.RABBITMQ_URL;
    if (!url || !EXCHANGE_NAME) {
      throw new Error('RABBITMQ_URL y RABBITMQ_EXCHANGE deben estar definidos en .env');
    }

    console.log('🐇 [NOTIFICATION] Intentando conectar a RabbitMQ...');
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
    await this.channel.assertQueue(QUEUE_NAME, { durable: true });

    for (const key of Object.values(ROUTING_KEYS)) {
      await this.channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, key);
      console.log(`🔗 [NOTIFICATION] Cola vinculada: ${QUEUE_NAME} → ${key}`);
    }

    console.log('✅ [NOTIFICATION] RabbitMQ conectado y escuchando eventos...');
  }

  async startConsuming(): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    console.log(`[*] [NOTIFICATION] Esperando mensajes en la cola: ${QUEUE_NAME}...`);
    this.channel.consume(QUEUE_NAME, async (msg: ConsumeMessage | null) => {
      if (msg) {
        try {
          console.log('📨 [NOTIFICATION] Mensaje recibido...');
          await this.handleMessage(msg);
          this.channel.ack(msg);
          console.log('✅ [NOTIFICATION] Mensaje confirmado (ACK).');
        } catch (err) {
          console.error('❌ [NOTIFICATION] Error al procesar mensaje:', err);
          this.channel.nack(msg);
        }
      }
    });
  }

  private async handleMessage(msg: ConsumeMessage): Promise<void> {
    const routingKey = msg.fields.routingKey;
    const contentString = msg.content.toString();

    console.log('🔑 [NOTIFICATION] Routing Key:', routingKey);
    console.log('📦 [NOTIFICATION] Contenido recibido:', contentString);

    const content = JSON.parse(contentString);

    try {
      switch (routingKey) {
        case ROUTING_KEYS.USER_REGISTERED:
          console.log('👤 [EVENT] Procesando user.registered...');
          const userDto = plainToInstance(UserRegisteredEventDto, content);
          await this.validateDto(userDto);
          await this.sendWelcomeEmailUseCase.execute(userDto);
          console.log('✅ [EVENT] Email de bienvenida enviado.');
          break;

        case ROUTING_KEYS.USER_EMAIL_VERIFICATION_RESENT:
          console.log('📧 [EVENT] Procesando user.email.verification.resent...');
          const verificationDto = plainToInstance(EmailVerificationEventDto, content);
          await this.validateDto(verificationDto);
          await this.sendVerificationEmailUseCase.execute(verificationDto);
          console.log('✅ [EVENT] Email de verificación reenviado.');
          break;

        case ROUTING_KEYS.USER_PASSWORD_RESET_REQUESTED:
          console.log('🔐 [EVENT] Procesando user.password.reset.requested...');
          const resetDto = plainToInstance(PasswordResetEventDto, content);
          await this.validateDto(resetDto);
          await this.sendPasswordResetEmailUseCase.execute(resetDto);
          console.log('✅ [EVENT] Email de reseteo de contraseña enviado.');
          break;

        case ROUTING_KEYS.USER_PHONE_VERIFICATION_RESENT:
          console.log('📱 [EVENT] Procesando user.phone.verification.resent...');
          const { phoneNumber, verificationCode } = content;
          if (!phoneNumber || !verificationCode) {
            throw new Error('Datos del evento de verificación de teléfono inválidos.');
          }
          await this.sendVerificationSMSUseCase.execute(phoneNumber, verificationCode);
          console.log(`✅ [EVENT] SMS de verificación enviado a ${phoneNumber}.`);
          break;

        case ROUTING_KEYS.KITCHEN_PENDING:
          console.log('🍽️ [EVENT] Procesando kitchen.pending...');
          const pendingDto = plainToInstance(KitchenPendingEventDto, content);
          await this.validateDto(pendingDto);
          await this.sendKitchenPendingEmailUseCase.execute(pendingDto);
          console.log('✅ [EVENT] Email de cocina pendiente enviado.');
          break;

        case ROUTING_KEYS.KITCHEN_APPROVED:
          console.log('🥳 [EVENT] Procesando kitchen.approved...');
          const approvedDto = plainToInstance(KitchenApprovedEventDto, content);
          await this.validateDto(approvedDto);
          await this.sendKitchenApprovedEmailUseCase.execute(approvedDto);
          console.log('✅ [EVENT] Email de aprobación de cocina enviado.');
          break;

        case ROUTING_KEYS.KITCHEN_REJECTED:
          console.log('🚫 [EVENT] Procesando kitchen.rejected...');
          const rejectedDto = plainToInstance(KitchenRejectedEventDto, content);
          await this.validateDto(rejectedDto);
          await this.sendKitchenRejectedEmailUseCase.execute(rejectedDto);
          console.log('✅ [EVENT] Email de rechazo de cocina enviado.');
          break;

        default:
          console.warn(`⚠️ [NOTIFICATION] Routing key no reconocido: ${routingKey}`);
      }
    } catch (error) {
      console.error(`❌ [NOTIFICATION] Error manejando evento ${routingKey}:`, error);
      throw error;
    }
  }

  private async validateDto(dto: object): Promise<void> {
    const errors = await validate(dto);
    if (errors.length > 0) {
      console.error('❌ [VALIDATION] DTO de evento inválido:', errors);
      throw new Error('Datos del evento inválidos.');
    }
  }
}