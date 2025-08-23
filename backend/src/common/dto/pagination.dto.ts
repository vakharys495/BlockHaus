// src/common/dto/pagination.dto.ts
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @IsPositive()
  limit?: number = 10;
}