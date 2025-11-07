import { ISMSService, SendSMSParams } from '../../domain/interfaces/ISMSService';
import { IEmailLogRepository } from '../../domain/interfaces/IEmailLogRepository';
import { EmailLog, LogStatus } from '../../domain/entitie/email-log.entity';

export class SendVerificationSMSUseCase {
  constructor(
    private readonly smsService: ISMSService,
    private readonly emailLogRepository: IEmailLogRepository
  ) {}

  async execute(phoneNumber: string, verificationCode: string): Promise<void> {
    const message = `Tu código de verificación de Chambealo es: ${verificationCode}`;
    let logStatus = LogStatus.SENT;
    let errorMsg: string | null = null;

    try {
      const smsParams: SendSMSParams = {
        recipient: phoneNumber,
        message: message,
      };

      await this.smsService.sendSMS(smsParams);
      console.log(`SMS de verificación enviado a ${phoneNumber}`);
    } catch (error: any) {
      console.error('Error al enviar SMS de verificación:', error);
      logStatus = LogStatus.FAILED;
      errorMsg = error.message;
    } finally {
      const smsLog = new EmailLog(
        0,
        phoneNumber,
        'Verificación por SMS',
        logStatus,
        new Date(),
        'Twilio',
        errorMsg
      );

      await this.emailLogRepository.save(smsLog);
    }
  }
}
