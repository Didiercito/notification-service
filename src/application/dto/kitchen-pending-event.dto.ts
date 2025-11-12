import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class KitchenPendingEventDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  kitchenName!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  timestamp!: string;
}
