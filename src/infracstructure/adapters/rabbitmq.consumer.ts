import * as amqp from 'amqplib';
import { Connection, Channel, ConsumeMessage } from 'amqplib';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserRegisteredEventDto } from '../../application/dto/user-registered-event.dto';
import { EmailVerificationEventDto } from '../../application/dto/email-verification-event.dto';
import { PasswordResetEventDto } from '../../application/dto/password-reset-event.dto';
import { SendPasswordResetEmailUseCase } from '../../application/use-cases/send-password-reset-email.use-case';
import { SendVerificationEmailUseCase } from '../../application/use-cases/send-verification-email.use-case';
import { SendWelcomeEmailUseCase } from '../../application/use-cases/send-welcome-email.use-case';

const EXCHANGE_NAME = process.env.RABBITMQ_EXCHANGE;
const QUEUE_NAME = 'notification_queue'; 

const ROUTING_KEYS = {
  USER_REGISTERED: 'user.registered',
  USER_EMAIL_VERIFICATION_RESENT: 'user.email.verification.resent',
  USER_PASSWORD_RESET_REQUESTED: 'user.password.reset.requested',
};

export class RabbitMQConsumer {
  private connection!: Connection;
  private channel!: Channel;

  constructor(
    private readonly sendWelcomeEmailUseCase: SendWelcomeEmailUseCase,
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
    private readonly sendPasswordResetEmailUseCase: SendPasswordResetEmailUseCase
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
        await this.sendVerificationEmailUseCase.execute(userDto as any);
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
