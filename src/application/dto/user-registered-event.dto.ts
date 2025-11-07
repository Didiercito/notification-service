import { IsEmail, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UserRegisteredEventDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  names: string;

  @IsString()
  @IsNotEmpty()
  verificationToken: string;
}