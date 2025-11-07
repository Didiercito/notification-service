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
      await this.client.messages.create({
        body: params.message,
        from: this.twilioPhone,
        to: params.recipient,
      });
      console.log(`📩 SMS enviado exitosamente a ${params.recipient}`);
    } catch (error: any) {
      console.error('❌ Error al enviar SMS con Twilio:', error);
      throw new Error(`Twilio error: ${error.message}`);
    }
  }
}
