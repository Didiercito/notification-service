import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class KitchenRejectedEventDto {
  @IsNumber()
  @IsNotEmpty()
  kitchenId!: number;

  @IsString()
  @IsNotEmpty()
  kitchenName!: string;

  @IsNumber()
  @IsNotEmpty()
  ownerId!: number;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  rejectionReason!: string;

  @IsString()
  @IsNotEmpty()
  timestamp!: string;
}