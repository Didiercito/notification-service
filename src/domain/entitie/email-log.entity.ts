import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsDate,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum LogStatus {
  SENT = 'sent',
  FAILED = 'failed',
}

export class EmailLog {
  @IsOptional()
  id: number;

  @IsEmail()
  @IsNotEmpty()
  recipient: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsNotEmpty()
  @IsEnum(LogStatus)
  status: LogStatus;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  error?: string | null;

  @IsDate()
  sentAt: Date;

  constructor(
    id: number,
    recipient: string,
    subject: string,
    status: LogStatus,
    sentAt: Date,
    provider?: string,
    error?: string | null
  ) {
    this.id = id;
    this.recipient = recipient;
    this.subject = subject;
    this.status = status;
    this.sentAt = sentAt;
    this.provider = provider;
    this.error = error;
  }
}