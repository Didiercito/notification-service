import { IsEmail, IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

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

  @IsOptional()
  @IsString()
  timestamp?: string;
}