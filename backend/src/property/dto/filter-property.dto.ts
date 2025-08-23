// src/modules/property/dto/filter-property.dto.ts
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FilterPropertyDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  bathrooms?: number;
}