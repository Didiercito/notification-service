import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { IEmailLogRepository } from '../../domain/interfaces/IEmailLogRepository';
import { EmailLog } from '../../domain/entitie/email-log.entity';
import { EmailLogSchema } from '../../database/schemas/email-log.schema';

export class EmailLogAdapter implements IEmailLogRepository {
  private repository: Repository<EmailLogSchema>;

  constructor() {
    this.repository = AppDataSource.getRepository(EmailLogSchema);
  }

  async save(log: EmailLog): Promise<EmailLog> {
    const schema = this.repository.create({
      recipient: log.recipient,
      subject: log.subject,
      status: log.status,
      provider: log.provider,
      error: log.error,
      sentAt: log.sentAt,
    });

    const savedSchema = await this.repository.save(schema);
    log.id = savedSchema.id;
    return log;
  }
}