import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class KitchenApprovedEventDto {
  @IsNotEmpty()
  @IsString()
  kitchenId!: string;

  @IsNotEmpty()
  @IsString()
  kitchenName!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  ownerId!: string;
}