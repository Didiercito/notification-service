import { ISMSService, SendSMSParams } from '../../domain/interfaces/ISMSService';
import { Twilio } from 'twilio';

export class TwilioSmsAdapter implements ISMSService {
  private client: Twilio;
  private twilioPhone: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      throw new Error('TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_PHONE_NUMBER deben estar definidos en .env');
    }

    this.twilioPhone = twilioPhone;
    this.client = new Twilio(accountSid, authToken);
  }

  async sendSMS(params: SendSMSParams): Promise<void> {
    try {
      const normalizedRecipient = this.normalizeMexicanNumber(params.recipient);

      await this.client.messages.create({
        body: params.message,
        from: this.twilioPhone,
        to: normalizedRecipient,
      });

      console.log(`📩 SMS enviado exitosamente a ${normalizedRecipient}`);
    } catch (error: any) {
      console.error('❌ Error al enviar SMS con Twilio:', error);
      throw new Error(`Twilio error: ${error.message}`);
    }
  }

  private normalizeMexicanNumber(raw: string): string {
    if (!raw) {
      throw new Error('El número de teléfono está vacío');
    }

    const digits = raw.replace(/\D/g, '');

    if (digits.length === 13 && digits.startsWith('52')) {
      return `+${digits}`;
    }

    if (digits.length === 12 && digits.startsWith('52')) {
      return `+${digits}`;
    }

    if (digits.length === 10) {
      return `+52${digits}`;
    }

    throw new Error(`El número "${raw}" no tiene un formato válido de México (debe tener 10 dígitos).`);
  }
}