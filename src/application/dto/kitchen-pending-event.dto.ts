import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class KitchenPendingEventDto {
  @IsNumber()
  @IsNotEmpty()
  userId!: number;

  @IsNumber()
  @IsNotEmpty()
  kitchenId!: number;

  @IsString()
  @IsNotEmpty()
  kitchenName!: string;

  @IsString()
  @IsNotEmpty()
  timestamp!: string;
}
