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
import { JwtAuthGuard } from 'src/common/guards';


@ApiTags('properties')
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new property and list it on blockchain' })
  async create(@Body() createPropertyDto: CreatePropertyDto) {
    try {
      const property = await this.propertyService.create(createPropertyDto);
      return {
        success: true,
        message: 'Property created and listed on blockchain successfully',
        data: property
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to create property' },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties' })
  @ApiQuery({ name: 'status', required: false, enum: PropertyStatus })
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
      return { success: true, data: properties, total: properties.length };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to fetch properties' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/book')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Book a property and execute blockchain transaction' })
  async bookProperty(
    @Param('id') propertyId: string,
    @Body() body: { bookPropertyDto: BookPropertyDto; tenant_address: string },
  ) {
    try {
      if (!body.tenant_address) {
        throw new Error('Tenant address is required');
      }
      const property = await this.propertyService.bookProperty(
        propertyId,
        body.bookPropertyDto,
        body.tenant_address
      );
      return {
        success: true,
        message: 'Property booked successfully on blockchain',
        data: property
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to book property' },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('pay-rent')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Pay rent for a property and execute blockchain transaction' })
  async payRent(
    @Body() body: { payRentDto: PayRentDtoo; tenant_address: string },
  ) {
    try {
      if (!body.tenant_address) {
        throw new Error('Tenant address is required');
      }
      const result = await this.propertyService.payRent(body.payRentDto, body.tenant_address);
      return {
        success: true,
        message: 'Rent paid successfully on blockchain',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to pay rent' },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // ✅ keep rest of endpoints as they are (findOne, update, delete, etc.)
}
