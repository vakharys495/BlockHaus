// src/modules/booking/booking.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  HttpStatus,
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
  @ApiOperation({ 
    summary: 'Create a new booking request',
    description: 'Creates a new property booking request and submits it to the blockchain. The booking will be in PENDING status until confirmed by the property owner.'
  })
  @ApiBody({
    type: CreateBookingDto,
    description: 'Booking creation data',
    examples: {
      example1: {
        summary: 'Standard booking request',
        description: 'A typical booking request for a 6-month lease',
        value: {
          property_id: '60d21b4667d0d8992e610c85',
          tenant_address: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
          duration_months: 6,
          lease_start_date: '2024-09-01T00:00:00.000Z',
          message: 'Looking forward to renting this beautiful apartment'
        }
      },
      example2: {
        summary: 'Long-term booking',
        description: 'A booking request for a 12-month lease',
        value: {
          property_id: '60d21b4667d0d8992e610c86',
          tenant_address: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
          duration_months: 12,
          lease_start_date: '2024-10-01T00:00:00.000Z',
          message: 'Interested in a long-term rental arrangement'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Booking request created successfully',
    schema: {
      type: 'object',
      properties: {
        booking: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d21b4667d0d8992e610c87' },
            property_id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
            blockchain_property_id: { type: 'number', example: 1 },
            tenant_address: { type: 'string', example: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' },
            owner_address: { type: 'string', example: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d' },
            duration_months: { type: 'number', example: 6 },
            rent_per_month: { type: 'number', example: 1500000000 },
            total_amount: { type: 'number', example: 9000000000 },
            status: { type: 'string', example: 'pending' },
            lease_start_date: { type: 'string', example: '2024-09-01T00:00:00.000Z' },
            lease_end_date: { type: 'string', example: '2025-03-01T00:00:00.000Z' },
            created_at: { type: 'string', example: '2024-08-22T10:30:00.000Z' }
          }
        },
        transaction_hash: { type: 'string', example: '0x1234567890abcdef' },
        message: { type: 'string', example: 'Booking request submitted successfully' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid booking data or property not available',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Property is not available for booking' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Property not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Property not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  create(@Body() createBookingDto: CreateBookingDto, @AuthUser() user: User) {
    return this.bookingService.create(createBookingDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ 
    summary: 'Get all bookings for authenticated user',
    description: 'Retrieves all bookings where the authenticated user is either the tenant or property owner. Supports filtering by booking status.'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter bookings by status',
    enum: ['pending', 'confirmed', 'cancelled', 'expired'],
    example: 'pending'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of bookings retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '60d21b4667d0d8992e610c87' },
          property_id: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
              title: { type: 'string', example: 'Modern Downtown Apartment' },
              location: {
                type: 'object',
                properties: {
                  city: { type: 'string', example: 'New York' },
                  address: { type: 'string', example: '123 Main St' }
                }
              }
            }
          },
          tenant_address: { type: 'string', example: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' },
          status: { type: 'string', example: 'pending' },
          duration_months: { type: 'number', example: 6 },
          total_amount: { type: 'number', example: 9000000000 },
          lease_start_date: { type: 'string', example: '2024-09-01T00:00:00.000Z' },
          created_at: { type: 'string', example: '2024-08-22T10:30:00.000Z' }
        }
      }
    }
  })
  findAll(@AuthUser() user: User, @Query('status') status: string) {
    return this.bookingService.findAll(user, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a specific booking by ID',
    description: 'Retrieves detailed information about a specific booking. User must be either the tenant or property owner to access the booking details.'
  })
  @ApiParam({
    name: 'id',
    description: 'Booking ID',
    example: '60d21b4667d0d8992e610c87'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Booking details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '60d21b4667d0d8992e610c87' },
        property_id: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
            title: { type: 'string', example: 'Modern Downtown Apartment' },
            description: { type: 'string', example: 'Beautiful 2-bedroom apartment in downtown' },
            location: {
              type: 'object',
              properties: {
                address: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
                country: { type: 'string', example: 'USA' }
              }
            },
            details: {
              type: 'object',
              properties: {
                bedrooms: { type: 'number', example: 2 },
                bathrooms: { type: 'number', example: 1 },
                area_sqft: { type: 'number', example: 900 }
              }
            }
          }
        },
        tenant_address: { type: 'string', example: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' },
        owner_address: { type: 'string', example: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d' },
        status: { type: 'string', example: 'pending' },
        duration_months: { type: 'number', example: 6 },
        rent_per_month: { type: 'number', example: 1500000000 },
        total_amount: { type: 'number', example: 9000000000 },
        transaction_hash: { type: 'string', example: '0x1234567890abcdef' },
        lease_start_date: { type: 'string', example: '2024-09-01T00:00:00.000Z' },
        lease_end_date: { type: 'string', example: '2025-03-01T00:00:00.000Z' },
        message: { type: 'string', example: 'Looking forward to renting this beautiful apartment' },
        created_at: { type: 'string', example: '2024-08-22T10:30:00.000Z' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Booking not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied - user not authorized to view this booking',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You do not have access to this booking' },
        error: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  findOne(@Param('id') id: string, @AuthUser() user: User) {
    return this.bookingService.findOne(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  @ApiOperation({ 
    summary: 'Update a booking',
    description: 'Updates booking status or other details. Typically used by property owners to confirm or reject booking requests.'
  })
  @ApiParam({
    name: 'id',
    description: 'Booking ID to update',
    example: '60d21b4667d0d8992e610c87'
  })
  @ApiBody({
    type: UpdateBookingDto,
    description: 'Booking update data',
    examples: {
      confirm: {
        summary: 'Confirm booking',
        description: 'Property owner confirms the booking request',
        value: {
          status: 'confirmed',
          transaction_hash: '0x9876543210fedcba',
          message: 'Booking confirmed. Welcome to the property!'
        }
      },
      cancel: {
        summary: 'Cancel booking',
        description: 'Cancel a booking with reason',
        value: {
          status: 'cancelled',
          message: 'Property no longer available due to maintenance issues'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Booking updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Booking updated successfully' },
        booking: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d21b4667d0d8992e610c87' },
            status: { type: 'string', example: 'confirmed' },
            transaction_hash: { type: 'string', example: '0x9876543210fedcba' },
            message: { type: 'string', example: 'Booking confirmed. Welcome to the property!' },
            updated_at: { type: 'string', example: '2024-08-22T11:00:00.000Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied - only property owner can update booking',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You do not have permission to update this booking' },
        error: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @AuthUser() user: User,
  ) {
    return this.bookingService.update(id, updateBookingDto, user);
  }
}