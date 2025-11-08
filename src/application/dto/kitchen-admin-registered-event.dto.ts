import { IsNotEmpty, IsEmail, IsString, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UserDataDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  names: string;

  @IsString()
  @IsNotEmpty()
  firstLastName: string;

  @IsString()
  @IsNotEmpty()
  secondLastName: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

class KitchenDataDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

class LocationDataDto {
  @IsString()
  @IsNotEmpty()
  streetAddress: string;

  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @IsNumber()
  @IsNotEmpty()
  stateId: number;

  @IsNumber()
  @IsNotEmpty()
  municipalityId: number;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;
}

export class KitchenAdminRegisteredEventDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ValidateNested()
  @Type(() => UserDataDto)
  @IsNotEmpty()
  userData: UserDataDto;

  @ValidateNested()
  @Type(() => KitchenDataDto)
  @IsNotEmpty()
  kitchenData: KitchenDataDto;

  @ValidateNested()
  @Type(() => LocationDataDto)
  @IsNotEmpty()
  locationData: LocationDataDto;

  @IsString()
  @IsNotEmpty()
  timestamp: string;
}