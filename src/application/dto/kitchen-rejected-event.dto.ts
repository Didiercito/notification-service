import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class KitchenRejectedEventDto {
  @IsNumber()
  @IsNotEmpty()
  kitchenId!: number;

  @IsNumber()
  @IsNotEmpty()
  ownerId!: number;

  @IsString()
  @IsNotEmpty()
  kitchenName!: string;

  @IsString()
  @IsNotEmpty()
  rejectionReason!: string;

  @IsNumber()
  @IsNotEmpty()
  rejectedBy!: number;

  @IsString()
  @IsNotEmpty()
  timestamp!: string;
}
