import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class KitchenApprovedEventDto {
  @IsNumber()
  @IsNotEmpty()
  kitchenId!: number;

  @IsNumber()
  @IsNotEmpty()
  ownerId!: number;

  @IsString()
  @IsNotEmpty()
  kitchenName!: string;

  @IsNumber()
  @IsNotEmpty()
  approvedBy!: number;

  @IsString()
  @IsNotEmpty()
  timestamp!: string;
}