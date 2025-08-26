// src/modules/booking/booking.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthUser } from '../common/decorators/auth-user.decorator';
import { User } from '../auth/entities/auth.entity';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new booking request' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Booking request created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid booking data' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Property not found' })
  async create(@Body() createBookingDto: CreateBookingDto, @AuthUser() user: User) {
    try {
      return await this.bookingService.create(createBookingDto, user);
    } catch (error) {
      throw new HttpException(
        { message: error.message || 'Failed to create booking' },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all bookings for authenticated user' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'confirmed', 'cancelled', 'expired'] })
  async findAll(@AuthUser() user: User, @Query('status') status: string) {
    try {
      return await this.bookingService.findAll(user, status);
    } catch (error) {
      throw new HttpException(
        { message: error.message || 'Failed to fetch bookings' },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async findOne(@Param('id') id: string, @AuthUser() user: User) {
    try {
      return await this.bookingService.findOne(id, user);
    } catch (error) {
      throw new HttpException(
        { message: error.message || 'Booking not found' },
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a booking (confirm/cancel)' })
  @ApiParam({ name: 'id', description: 'Booking ID to update' })
  @ApiBody({ type: UpdateBookingDto })
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @AuthUser() user: User,
  ) {
    try {
      return await this.bookingService.update(id, updateBookingDto, user);
    } catch (error) {
      throw new HttpException(
        { message: error.message || 'Failed to update booking' },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
