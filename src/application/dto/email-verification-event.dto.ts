import { IsEmail, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class EmailVerificationEventDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  verificationToken: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  verificationUrl: string;
}