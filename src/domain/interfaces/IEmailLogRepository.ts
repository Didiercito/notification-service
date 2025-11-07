import { EmailLog } from '../entitie/email-log.entity';

export interface IEmailLogRepository {
    save(log: EmailLog): Promise<EmailLog>;
}