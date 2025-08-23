// src/modules/property/dto/update-property.dto.ts
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  details?: {
    location: string;
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
  };

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsArray()
  images?: string[];
}