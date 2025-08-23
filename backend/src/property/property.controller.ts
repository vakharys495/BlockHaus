import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  Request
} from '@nestjs/common';
import { PropertyService, CreatePropertyDto, UpdatePropertyDto } from './property.service';
import { BookPropertyDto, PayRentDtoo } from './dto/create-property.dto';
import { PropertyStatus } from './entities/property.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

// Mock auth guard - replace with your actual authentication
@Controller('auth')
export class AuthGuard {
  canActivate(): boolean {
    return true; // Replace with actual auth logic
  }
}

@ApiTags('properties')
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property and list it on blockchain' })
  @ApiResponse({ status: 201, description: 'Property created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or blockchain transaction failed' })
  async create(@Body() createPropertyDto: CreatePropertyDto) {
    try {
      console.log('Creating property via controller:', createPropertyDto);
      
      const property = await this.propertyService.create(createPropertyDto);
      
      return {
        success: true,
        message: 'Property created and listed on blockchain successfully',
        data: property
      };
    } catch (error) {
      console.error('Controller error creating property:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to create property'
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties' })
  @ApiQuery({ name: 'status', required: false, enum: PropertyStatus })
  @ApiQuery({ name: 'property_type', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'min_rent', required: false })
  @ApiQuery({ name: 'max_rent', required: false })
  @ApiQuery({ name: 'bedrooms', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async findAll(@Query() query: any) {
    try {
      const filters = {
        status: query.status,
        property_type: query.property_type,
        city: query.city,
        min_rent: query.min_rent ? parseInt(query.min_rent) : undefined,
        max_rent: query.max_rent ? parseInt(query.max_rent) : undefined,
        bedrooms: query.bedrooms ? parseInt(query.bedrooms) : undefined,
        limit: query.limit ? parseInt(query.limit) : undefined,
        offset: query.offset ? parseInt(query.offset) : undefined,
      };

      const properties = await this.propertyService.findAll(filters);
      
      return {
        success: true,
        data: properties,
        total: properties.length
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch properties'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available properties with pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAvailable(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    try {
      const properties = await this.propertyService.findAvailable(
        parseInt(page),
        parseInt(limit)
      );
      
      return {
        success: true,
        data: properties,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: properties.length
        }
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch available properties'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('owner/:ownerAddress')
  @ApiOperation({ summary: 'Get properties by owner address' })
  async findByOwner(@Param('ownerAddress') ownerAddress: string) {
    try {
      const properties = await this.propertyService.findByOwner(ownerAddress);
      
      return {
        success: true,
        data: properties,
        total: properties.length
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch owner properties'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('tenant/:tenantAddress')
  @ApiOperation({ summary: 'Get properties by tenant address' })
  async findByTenant(@Param('tenantAddress') tenantAddress: string) {
    try {
      const properties = await this.propertyService.findByTenant(tenantAddress);
      
      return {
        success: true,
        data: properties,
        total: properties.length
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch tenant properties'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get property statistics' })
  async getStats() {
    try {
      const stats = await this.propertyService.getStats();
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch property statistics'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a property by ID' })
  async findOne(@Param('id') id: string) {
    try {
      const property = await this.propertyService.findOne(id);
      
      return {
        success: true,
        data: property
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Property not found'
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a property' })
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto
  ) {
    try {
      const property = await this.propertyService.update(id, updatePropertyDto);
      
      return {
        success: true,
        message: 'Property updated successfully',
        data: property
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to update property'
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property' })
  async remove(@Param('id') id: string) {
    try {
      await this.propertyService.remove(id);
      
      return {
        success: true,
        message: 'Property deleted successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to delete property'
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post(':id/book')
  @ApiOperation({ summary: 'Book a property and execute blockchain transaction' })
  @ApiResponse({ status: 200, description: 'Property booked successfully' })
  @ApiResponse({ status: 400, description: 'Booking failed or blockchain transaction failed' })
  async bookProperty(
    @Param('id') propertyId: string,
    @Body() bookPropertyDto: BookPropertyDto,
    @Body('tenant_address') tenantAddress?: string // Get from body or auth
  ) {
    try {
      console.log('Booking property via controller:', {
        propertyId,
        bookPropertyDto,
        tenantAddress
      });

      // If tenant_address is not provided in body, it should come from authentication
      // For now, using the one from body or throw error
      if (!tenantAddress) {
        throw new Error('Tenant address is required');
      }
      
      const property = await this.propertyService.bookProperty(
        propertyId,
        bookPropertyDto,
        tenantAddress
      );
      
      return {
        success: true,
        message: 'Property booked successfully on blockchain',
        data: property
      };
    } catch (error) {
      console.error('Controller error booking property:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to book property'
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('pay-rent')
  @ApiOperation({ summary: 'Pay rent for a property and execute blockchain transaction' })
  @ApiResponse({ status: 200, description: 'Rent paid successfully' })
  @ApiResponse({ status: 400, description: 'Payment failed or blockchain transaction failed' })
  async payRent(
    @Body() payRentDto: PayRentDtoo,
    @Body('tenant_address') tenantAddress?: string // Get from body or auth
  ) {
    try {
      console.log('Paying rent via controller:', {
        payRentDto,
        tenantAddress
      });

      // If tenant_address is not provided in body, it should come from authentication
      if (!tenantAddress) {
        throw new Error('Tenant address is required');
      }
      
      const result = await this.propertyService.payRent(payRentDto, tenantAddress);
      
      return {
        success: true,
        message: 'Rent paid successfully on blockchain',
        data: result
      };
    } catch (error) {
      console.error('Controller error paying rent:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to pay rent'
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get(':id/bookings')
  @ApiOperation({ summary: 'Get property bookings' })
  async getPropertyBookings(@Param('id') propertyId: string) {
    try {
      const bookings = await this.propertyService.getPropertyBookings(propertyId);
      
      return {
        success: true,
        data: bookings,
        total: bookings.length
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch property bookings'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Get property payments' })
  async getPropertyPayments(@Param('id') propertyId: string) {
    try {
      const payments = await this.propertyService.getPropertyPayments(propertyId);
      
      return {
        success: true,
        data: payments,
        total: payments.length
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch property payments'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('tenant/:tenantAddress/payments')
  @ApiOperation({ summary: 'Get tenant payments' })
  async getTenantPayments(@Param('tenantAddress') tenantAddress: string) {
    try {
      const payments = await this.propertyService.getTenantPayments(tenantAddress);
      
      return {
        success: true,
        data: payments,
        total: payments.length
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch tenant payments'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('sync/:blockchainId')
  @ApiOperation({ summary: 'Sync property data with blockchain' })
  async syncWithBlockchain(@Param('blockchainId') blockchainId: string) {
    try {
      const property = await this.propertyService.syncWithBlockchain(
        parseInt(blockchainId)
      );
      
      return {
        success: true,
        message: 'Property synced with blockchain successfully',
        data: property
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to sync property with blockchain'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('transaction/:hash/status')
  @ApiOperation({ summary: 'Check transaction status' })
  async checkTransactionStatus(@Param('hash') transactionHash: string) {
    try {
      const status = await this.propertyService.checkTransactionStatus(transactionHash);
      
      return {
        success: true,
        data: status
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to check transaction status'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // LEGACY ENDPOINTS (for backward compatibility)
  @Post('prepare-listing')
  @ApiOperation({ 
    summary: 'Prepare property listing transaction (DEPRECATED)',
    deprecated: true 
  })
  async preparePropertyListing(
    @Body() createPropertyDto: CreatePropertyDto,
    @Body('owner_address') ownerAddress: string
  ) {
    try {
      const result = await this.propertyService.preparePropertyListing(
        createPropertyDto,
        ownerAddress
      );
      
      return {
        success: true,
        message: 'Transaction prepared for frontend execution (DEPRECATED - use POST /properties instead)',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to prepare listing transaction'
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}