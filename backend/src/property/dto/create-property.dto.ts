import { IsEnum, IsOptional, IsString, IsNumber, IsArray, IsEmail, IsPhoneNumber, ValidateNested, IsBoolean, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyStatus } from '../entities/property.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CoordinatesDto {
  @ApiProperty()
  @IsNumber()
  latitude: number;

  @ApiProperty()
  @IsNumber()
  longitude: number;
}

export class LocationDto {
  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;
}

export class DetailsDto {
  @ApiProperty()
  @IsNumber()
  bedrooms: number;

  @ApiProperty()
  @IsNumber()
  bathrooms: number;

  @ApiProperty()
  @IsNumber()
  area_sqft: number;

  @ApiProperty()
  @IsBoolean()
  furnished: boolean;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  amenities: string[];
}

export class ContactInfoDto {
  @ApiProperty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: ['phone', 'email'] })
  @IsEnum(['phone', 'email'])
  preferred_contact_method: 'phone' | 'email';
}

export class CreatePropertyDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  owner_address: string;

  @ApiProperty()
  @IsNumber()
  rent_per_month: number;

  @ApiProperty()
  @IsString()
  property_type: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => DetailsDto)
  details: DetailsDto;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contact_info: ContactInfoDto;
}

export class UpdatePropertyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rent_per_month?: number;

  @ApiProperty({ enum: PropertyStatus, required: false })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DetailsDto)
  details?: DetailsDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contact_info?: ContactInfoDto;
}

export class BookPropertyDto {
  @ApiProperty()
  @IsNumber()
  duration_months: number;

  @ApiProperty()
  lease_start_date: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  transaction_hash?: string;
}

export class PayRentDtoo {
  @ApiProperty()
  @IsString()
  property_id: string;

  @ApiProperty()
  @IsNumber()
  amount: number;
}

export class PropertyFilterDto {
  @ApiProperty({ enum: PropertyStatus, required: false })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  property_type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  min_rent?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  max_rent?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  offset?: number;
}