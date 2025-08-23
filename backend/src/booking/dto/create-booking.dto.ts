// src/modules/booking/dto/create-booking.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'The ID of the property to book',
    example: '60d21b4667d0d8992e610c85',
    type: 'string'
  })
  @IsString()
  @IsNotEmpty()
  property_id: string;

  @ApiProperty({
    description: 'StarkNet wallet address of the tenant',
    example: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    type: 'string'
  })
  @IsString()
  @IsNotEmpty()
  tenant_address: string;

  @ApiProperty({
    description: 'Duration of the lease in months (minimum 1)',
    example: 6,
    minimum: 1,
    type: 'number'
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  duration_months: number;

  @ApiProperty({
    description: 'Start date of the lease period',
    example: '2024-09-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  @IsDateString()
  lease_start_date: Date;

  @ApiPropertyOptional({
    description: 'Optional message from tenant to property owner',
    example: 'Looking forward to renting this beautiful apartment',
    type: 'string'
  })
  @IsOptional()
  @IsString()
  message?: string;
}

