// src/modules/booking/dto/update-booking.dto.ts
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '../entities/booking.entity';

export class UpdateBookingDto {
  @ApiPropertyOptional({
    description: 'New booking status',
    enum: BookingStatus,
    example: 'confirmed',
    enumName: 'BookingStatus'
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({
    description: 'StarkNet transaction hash for blockchain confirmation',
    example: '0x9876543210fedcba',
    type: 'string'
  })
  @IsOptional()
  @IsString()
  transaction_hash?: string;

  @ApiPropertyOptional({
    description: 'Message or note about the booking update',
    example: 'Booking confirmed. Welcome to the property!',
    type: 'string'
  })
  @IsOptional()
  @IsString()
  message?: string;
}