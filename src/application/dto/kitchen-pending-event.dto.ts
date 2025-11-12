import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
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

export class KitchenPendingEventDto {
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
}