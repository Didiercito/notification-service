export interface SendEmailParams {
  recipient: string;
  subject: string;
  htmlBody: string;
}

export interface IEmailService {
  sendEmail(params: SendEmailParams): Promise<void>;
}