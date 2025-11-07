import { EmailLog } from '../entitie/email-log.entity';
import { BaseValidator } from './validator';

export class EmailLogValidator extends BaseValidator<EmailLog> {
  constructor(emailLog: EmailLog) {
    super(emailLog);
  }

  public async validateRules(): Promise<void> {
    await this.validateOrThrow();
  }
}