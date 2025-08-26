import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property, PropertyDocument, PropertyStatus } from './entities/property.entity';
import { StarknetService, TransactionResult } from '../common/integrations/starknet/starknet.service';
import { BookPropertyDto, PayRentDtoo } from './dto/create-property.dto';

export interface CreatePropertyDto {
  title: string;
  description: string;
  owner_address: string;
  rent_per_month: number;
  property_type: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  details: {
    bedrooms: number;
    bathrooms: number;
    area_sqft: number;
    furnished: boolean;
    amenities: string[];
  };
  images?: string[];
  contact_info: {
    phone: string;
    email: string;
    preferred_contact_method: 'phone' | 'email';
  };
}

export interface UpdatePropertyDto {
  title?: string;
  description?: string;
  rent_per_month?: number;
  status?: PropertyStatus;
  images?: string[];
  details?: {
    bedrooms?: number;
    bathrooms?: number;
    area_sqft?: number;
    furnished?: boolean;
    amenities?: string[];
  };
  contact_info?: {
    phone?: string;
    email?: string;
    preferred_contact_method?: 'phone' | 'email';
  };
}

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<PropertyDocument>,
    private starknetService: StarknetService
  ) {}

  /**
   * Create a new property and execute blockchain transaction
   */
  async create(createPropertyDto: CreatePropertyDto): Promise<PropertyDocument> {
    try {
      console.log('Creating property:', createPropertyDto);

      // ✅ Execute blockchain transaction directly
      const transactionResult = await this.starknetService.listProperty(
        createPropertyDto.rent_per_month,
        createPropertyDto.description
      );

      if (transactionResult.status !== 'success') {
        throw new Error('Blockchain transaction failed');
      }

      // ✅ Save to Mongo after successful blockchain tx
      const property = new this.propertyModel({
        ...createPropertyDto,
        owner_address: createPropertyDto.owner_address.toLowerCase(),
        blockchain_id: transactionResult.property_id,
        transaction_hash: transactionResult.transaction_hash,
        status: PropertyStatus.AVAILABLE,
        listed_at: new Date(),
        is_active: true
      });

      return await property.save();
    } catch (error) {
      throw new BadRequestException(`Failed to create property: ${error.message}`);
    }
  }

  /**
   * Find all properties with optional filters
   */
  async findAll(filters?: {
    status?: PropertyStatus;
    property_type?: string;
    city?: string;
    min_rent?: number;
    max_rent?: number;
    bedrooms?: number;
    limit?: number;
    offset?: number;
  }): Promise<PropertyDocument[]> {
    const query: any = { is_active: true };

    if (filters) {
      if (filters.status) query.status = filters.status;
      if (filters.property_type) query.property_type = filters.property_type;
      if (filters.city) query['location.city'] = filters.city;
      if (filters.min_rent !== undefined || filters.max_rent !== undefined) {
        query.rent_per_month = {};
        if (filters.min_rent !== undefined) query.rent_per_month.$gte = filters.min_rent;
        if (filters.max_rent !== undefined) query.rent_per_month.$lte = filters.max_rent;
      }
      if (filters.bedrooms) query['details.bedrooms'] = filters.bedrooms;
    }

    let queryBuilder = this.propertyModel.find(query);

    if (filters?.limit) queryBuilder = queryBuilder.limit(filters.limit);
    if (filters?.offset) queryBuilder = queryBuilder.skip(filters.offset);

    return queryBuilder.sort({ listed_at: -1 }).exec();
  }

  async findOne(id: string): Promise<PropertyDocument> {
    const property = await this.propertyModel.findById(id).where({ is_active: true }).exec();
    if (!property) throw new NotFoundException(`Property with ID ${id} not found`);
    return property;
  }

  async findByBlockchainId(blockchainId: number): Promise<PropertyDocument> {
    const property = await this.propertyModel.findOne({ blockchain_id: blockchainId, is_active: true }).exec();
    if (!property) throw new NotFoundException(`Property with blockchain ID ${blockchainId} not found`);
    return property;
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<PropertyDocument> {
    const property = await this.propertyModel
      .findByIdAndUpdate(id, { ...updatePropertyDto, updatedAt: new Date() }, { new: true, runValidators: true })
      .where({ is_active: true })
      .exec();

    if (!property) throw new NotFoundException(`Property with ID ${id} not found`);
    return property;
  }

  async remove(id: string): Promise<void> {
    const result = await this.propertyModel
      .findByIdAndUpdate(id, { is_active: false, updatedAt: new Date() }, { new: true })
      .exec();

    if (!result) throw new NotFoundException(`Property with ID ${id} not found`);
  }

  async bookProperty(
    propertyId: string,
    bookPropertyDto: BookPropertyDto,
    tenantAddress: string
  ): Promise<PropertyDocument> {
    try {
      const property = await this.findOne(propertyId);

      if (property.status !== PropertyStatus.AVAILABLE) {
        throw new BadRequestException('Property is not available for booking');
      }

      // ✅ Execute on-chain booking
      const transactionResult = await this.starknetService.bookProperty(
        property.blockchain_id,
        bookPropertyDto.duration_months
      );

      if (transactionResult.status !== 'success') {
        throw new Error('Blockchain booking transaction failed');
      }

      const startDate = bookPropertyDto.lease_start_date || new Date();
      const leaseEndDate = new Date(startDate);
      leaseEndDate.setMonth(leaseEndDate.getMonth() + bookPropertyDto.duration_months);

      const updatedProperty = await this.propertyModel.findByIdAndUpdate(
        propertyId,
        {
          status: PropertyStatus.BOOKED,
          tenant_address: tenantAddress.toLowerCase(),
          lease_duration_months: bookPropertyDto.duration_months,
          lease_start_date: startDate,
          lease_end_date: leaseEndDate,
          booked_at: new Date(),
          booking_transaction_hash: transactionResult.transaction_hash
        },
        { new: true }
      ).exec();

      if (!updatedProperty) {
        throw new NotFoundException(`Property with ID ${propertyId} not found`);
      }

      return updatedProperty;
    } catch (error) {
      throw new BadRequestException(`Failed to book property: ${error.message}`);
    }
  }

  async payRent(
    payRentDto: PayRentDtoo,
    tenantAddress: string
  ): Promise<{ success: boolean; transaction_hash: string; property: PropertyDocument }> {
    try {
      const property = await this.findOne(payRentDto.property_id);

      if (property.status !== PropertyStatus.BOOKED) {
        throw new BadRequestException('Property is not currently booked');
      }

      if (property.tenant_address !== tenantAddress.toLowerCase()) {
        throw new BadRequestException('Only the tenant can pay rent for this property');
      }

      // ✅ Execute on-chain rent payment
      const transactionResult = await this.starknetService.payRent(
        property.blockchain_id,
        payRentDto.amount
      );

      if (transactionResult.status !== 'success') {
        throw new Error('Blockchain rent payment failed');
      }

      return {
        success: true,
        transaction_hash: transactionResult.transaction_hash,
        property
      };
    } catch (error) {
      throw new BadRequestException(`Failed to pay rent: ${error.message}`);
    }
  }

  async syncWithBlockchain(blockchainId: number): Promise<PropertyDocument> {
    const blockchainData = await this.starknetService.getProperty(blockchainId);

    const property = await this.propertyModel.findOneAndUpdate(
      { blockchain_id: blockchainId },
      {
        owner_address: blockchainData.owner.toLowerCase(),
        tenant_address: blockchainData.tenant?.toLowerCase() || null,
        rent_per_month: parseInt(blockchainData.rent_per_month),
        status: blockchainData.is_available ? PropertyStatus.AVAILABLE : PropertyStatus.BOOKED
      },
      { new: true }
    ).exec();

    if (!property) {
      throw new NotFoundException(`Property with blockchain ID ${blockchainId} not found`);
    }

    return property;
  }

  async getStats(): Promise<{ total: number; available: number; booked: number; maintenance: number }> {
    const [total, available, booked, maintenance] = await Promise.all([
      this.propertyModel.countDocuments({ is_active: true }),
      this.propertyModel.countDocuments({ status: PropertyStatus.AVAILABLE, is_active: true }),
      this.propertyModel.countDocuments({ status: PropertyStatus.BOOKED, is_active: true }),
      this.propertyModel.countDocuments({ status: PropertyStatus.MAINTENANCE, is_active: true }),
    ]);
    return { total, available, booked, maintenance };
  }

  async checkTransactionStatus(transactionHash: string): Promise<TransactionResult> {
    return this.starknetService.checkTransactionStatus(transactionHash);
  }
}
