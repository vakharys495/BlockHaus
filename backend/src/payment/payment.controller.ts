// src/modules/payment/payment.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Param, 
  Get,
  Query,
  HttpStatus 
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthUser } from '../common/decorators/auth-user.decorator';
import { User } from '../auth/entities/auth.entity';

// DTOs for better API documentation
export class PaymentDto {
  amount: number;
}

export class PayDepositDto extends PaymentDto {}

export class PayRentDto extends PaymentDto {}

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('deposit/:bookingId')
  @ApiOperation({ 
    summary: 'Pay security deposit for booking',
    description: 'Processes a security deposit payment for a confirmed booking. The deposit is typically required before the tenant can move in.'
  })
  @ApiParam({
    name: 'bookingId',
    description: 'The booking ID for which to pay the deposit',
    example: '60d21b4667d0d8992e610c87'
  })
  @ApiBody({
    type: PayDepositDto,
    description: 'Deposit payment details',
    examples: {
      standard_deposit: {
        summary: 'Standard security deposit',
        description: 'Typical security deposit payment equal to one month rent',
        value: {
          amount: 1500000000
        }
      },
      double_deposit: {
        summary: 'Double security deposit',
        description: 'Higher security deposit for premium properties',
        value: {
          amount: 3000000000
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Deposit payment processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Deposit payment processed successfully' },
        payment: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d21b4667d0d8992e610c88' },
            property_id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
            blockchain_property_id: { type: 'number', example: 1 },
            from_address: { type: 'string', example: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' },
            to_address: { type: 'string', example: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d' },
            amount: { type: 'number', example: 1500000000 },
            payment_type: { type: 'string', example: 'deposit' },
            status: { type: 'string', example: 'pending' },
            transaction_hash: { type: 'string', example: '0xabcdef1234567890' },
            created_at: { type: 'string', example: '2024-08-22T12:00:00.000Z' }
          }
        },
        transaction_hash: { type: 'string', example: '0xabcdef1234567890' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid booking or payment data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Booking not found or not in valid state for deposit payment' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User not authorized to pay deposit for this booking',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You are not authorized to pay deposit for this booking' },
        error: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  payDeposit(
    @Param('bookingId') bookingId: string,
    @Body() payDepositDto: PayDepositDto,
    @AuthUser() user: User,
  ) {
    return this.paymentService.payDeposit(bookingId, payDepositDto.amount, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rent/:bookingId')
  @ApiOperation({ 
    summary: 'Pay monthly rent for booking',
    description: 'Processes a monthly rent payment for an active booking. This endpoint handles recurring rent payments throughout the lease period.'
  })
  @ApiParam({
    name: 'bookingId',
    description: 'The booking ID for which to pay rent',
    example: '60d21b4667d0d8992e610c87'
  })
  @ApiBody({
    type: PayRentDto,
    description: 'Rent payment details',
    examples: {
      monthly_rent: {
        summary: 'Regular monthly rent',
        description: 'Standard monthly rent payment',
        value: {
          amount: 1500000000
        }
      },
      rent_with_late_fee: {
        summary: 'Late rent payment',
        description: 'Monthly rent payment with late fee included',
        value: {
          amount: 1650000000
        }
      },
      prorated_rent: {
        summary: 'Prorated rent payment',
        description: 'Partial month rent payment',
        value: {
          amount: 750000000
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Rent payment processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Rent payment processed successfully' },
        payment: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d21b4667d0d8992e610c89' },
            property_id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
            blockchain_property_id: { type: 'number', example: 1 },
            from_address: { type: 'string', example: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' },
            to_address: { type: 'string', example: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d' },
            amount: { type: 'number', example: 1500000000 },
            payment_type: { type: 'string', example: 'rent' },
            status: { type: 'string', example: 'pending' },
            transaction_hash: { type: 'string', example: '0x1234567890abcdef' },
            payment_period_start: { type: 'string', example: '2024-09-01T00:00:00.000Z' },
            payment_period_end: { type: 'string', example: '2024-09-30T23:59:59.999Z' },
            due_date: { type: 'string', example: '2024-09-01T00:00:00.000Z' },
            is_late_payment: { type: 'boolean', example: false },
            late_fee: { type: 'number', example: 0 },
            created_at: { type: 'string', example: '2024-08-22T12:00:00.000Z' }
          }
        },
        transaction_hash: { type: 'string', example: '0x1234567890abcdef' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid booking or payment data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Booking not found or rent already paid for current period' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User not authorized to pay rent for this booking',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You are not authorized to pay rent for this booking' },
        error: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  payRent(
    @Param('bookingId') bookingId: string,
    @Body() payRentDto: PayRentDto,
    @AuthUser() user: User,
  ) {
    return this.paymentService.payRent(bookingId, payRentDto.amount, user);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('history')
  // @ApiOperation({ 
  //   summary: 'Get payment history',
  //   description: 'Retrieves payment history for the authenticated user. Shows all payments where the user is either the payer or recipient.'
  // })
  // @ApiQuery({
  //   name: 'type',
  //   required: false,
  //   description: 'Filter by payment type',
  //   enum: ['rent', 'deposit', 'refund', 'penalty'],
  //   example: 'rent'
  // })
  // @ApiQuery({
  //   name: 'status',
  //   required: false,
  //   description: 'Filter by payment status',
  //   enum: ['pending', 'completed', 'failed', 'cancelled'],
  //   example: 'completed'
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Number of payments to retrieve',
  //   type: 'number',
  //   example: 10
  // })
  // @ApiQuery({
  //   name: 'offset',
  //   required: false,
  //   description: 'Number of payments to skip',
  //   type: 'number',
  //   example: 0
  // })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Payment history retrieved successfully',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       payments: {
  //         type: 'array',
  //         items: {
  //           type: 'object',
  //           properties: {
  //             _id: { type: 'string', example: '60d21b4667d0d8992e610c89' },
  //             property_id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
  //             amount: { type: 'number', example: 1500000000 },
  //             payment_type: { type: 'string', example: 'rent' },
  //             status: { type: 'string', example: 'completed' },
  //             transaction_hash: { type: 'string', example: '0x1234567890abcdef' },
  //             created_at: { type: 'string', example: '2024-08-22T12:00:00.000Z' },
  //             confirmed_at: { type: 'string', example: '2024-08-22T12:05:00.000Z' }
  //           }
  //         }
  //       },
  //       pagination: {
  //         type: 'object',
  //         properties: {
  //           total: { type: 'number', example: 25 },
  //           limit: { type: 'number', example: 10 },
  //           offset: { type: 'number', example: 0 },
  //           hasMore: { type: 'boolean', example: true }
  //         }
  //       }
  //     }
  //   }
  // })
  // getPaymentHistory(
  //   @AuthUser() user: User,
  //   @Query('type') type?: string,
  //   @Query('status') status?: string,
  //   @Query('limit') limit: number = 10,
  //   @Query('offset') offset: number = 0,
  // ) {
  //   return this.paymentService.getPaymentHistory(user, { type, status, limit, offset });
  // }

  @UseGuards(JwtAuthGuard)
  @Get(':paymentId')
  @ApiOperation({ 
    summary: 'Get payment details',
    description: 'Retrieves detailed information about a specific payment transaction.'
  })
  @ApiParam({
    name: 'paymentId',
    description: 'Payment ID to retrieve',
    example: '60d21b4667d0d8992e610c89'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '60d21b4667d0d8992e610c89' },
        property_id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
        blockchain_property_id: { type: 'number', example: 1 },
        from_address: { type: 'string', example: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' },
        to_address: { type: 'string', example: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d' },
        amount: { type: 'number', example: 1500000000 },
        payment_type: { type: 'string', example: 'rent' },
        status: { type: 'string', example: 'completed' },
        transaction_hash: { type: 'string', example: '0x1234567890abcdef' },
        block_number: { type: 'number', example: 123456 },
        block_hash: { type: 'string', example: '0xblock123456' },
        payment_period_start: { type: 'string', example: '2024-09-01T00:00:00.000Z' },
        payment_period_end: { type: 'string', example: '2024-09-30T23:59:59.999Z' },
        due_date: { type: 'string', example: '2024-09-01T00:00:00.000Z' },
        is_late_payment: { type: 'boolean', example: false },
        late_fee: { type: 'number', example: 0 },
        created_at: { type: 'string', example: '2024-08-22T12:00:00.000Z' },
        confirmed_at: { type: 'string', example: '2024-08-22T12:05:00.000Z' },
        metadata: {
          type: 'object',
          properties: {
            invoiceId: { type: 'string', example: 'INV-2024-001' },
            notes: { type: 'string', example: 'Monthly rent payment for September 2024' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Payment not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied - user not authorized to view this payment',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You are not authorized to view this payment' },
        error: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  getPaymentDetails(
    @Param('paymentId') paymentId: string,
    @AuthUser() user: User,
  ) {
    return this.paymentService.getPaymentHistory(paymentId, user);
  }
}