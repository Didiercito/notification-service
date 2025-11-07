import { IsEmail, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class PasswordResetEventDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  resetToken: string;
}