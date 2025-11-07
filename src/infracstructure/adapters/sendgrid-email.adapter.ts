import { IEmailService, SendEmailParams } from '../../domain/interfaces/IEmailService';
import sgMail from '@sendgrid/mail';

export class SendGridEmailAdapter implements IEmailService {
  private readonly senderEmail: string;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    this.senderEmail = process.env.SENDGRID_SENDER_EMAIL as string; 

    if (!apiKey || !this.senderEmail) {
      throw new Error('SENDGRID_API_KEY y SENDGRID_SENDER_EMAIL deben estar definidos en .env');
    }
    
    sgMail.setApiKey(apiKey);
  }

  async sendEmail(params: SendEmailParams): Promise<void> {
    const msg = {
      to: params.recipient,
      from: this.senderEmail!, 
      subject: params.subject,
      html: params.htmlBody,
    };

    try {
      await sgMail.send(msg);
      console.log(`Correo enviado exitosamente a ${params.recipient}`);
    } catch (error: any) { 
      console.error('Error al enviar correo con SendGrid:', error);
      
      if (error.response) {
        console.error('Error Body:', error.response.body);
      }
      
      throw new Error(`SendGrid error: ${error.message}`);
    }
  }
}