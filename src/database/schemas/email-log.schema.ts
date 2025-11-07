import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { LogStatus } from '../../domain/entitie/email-log.entity';

@Entity('Email_Logs')
@Index('IDX_EMAIL_LOG_RECIPIENT', ['recipient'])
@Index('IDX_EMAIL_LOG_STATUS', ['status'])
export class EmailLogSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  recipient: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'enum', enum: LogStatus })
  status: LogStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider?: string;

  @Column({ type: 'text', nullable: true })
  error?: string | null;

  @CreateDateColumn({ name: 'sent_at' })
  sentAt: Date;
}