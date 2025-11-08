import { IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UserData {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  names: string;
}

class KitchenData {
  @IsNotEmpty()
  name: string;
}

export class KitchenRejectedEventDto {
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UserData)
  userData: UserData;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => KitchenData)
  kitchenData: KitchenData;

  @IsString()
  @IsNotEmpty()
  rejectionReason: string;
}