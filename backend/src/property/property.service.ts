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

      // Execute blockchain transaction first
      const transactionResult = await this.starknetService.listProperty(
        createPropertyDto.rent_per_month,
        createPropertyDto.description
      );

      console.log('Blockchain transaction completed:', transactionResult);

      if (transactionResult.status !== 'success') {
        throw new Error('Blockchain transaction failed');
      }

      // Save to database after successful blockchain transaction
      const property = new this.propertyModel({
        ...createPropertyDto,
        owner_address: createPropertyDto.owner_address.toLowerCase(),
        blockchain_id: transactionResult.property_id,
        transaction_hash: transactionResult.transaction_hash,
        status: PropertyStatus.AVAILABLE,
        listed_at: new Date(),
        is_active: true
      });

      const savedProperty = await property.save();
      console.log('Property saved to database:', savedProperty._id);

      return savedProperty;
    } catch (error) {
      console.error('Failed to create property:', error);
      throw new BadRequestException(`Failed to create property: ${error.message}`);
    }
  }

  /**
   * Create a new property (alias method)
   */
  async createProperty(createPropertyDto: CreatePropertyDto): Promise<PropertyDocument> {
    return this.create(createPropertyDto);
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
    
    if (filters?.limit) {
      queryBuilder = queryBuilder.limit(filters.limit);
    }
    if (filters?.offset) {
      queryBuilder = queryBuilder.skip(filters.offset);
    }
    
    return queryBuilder.sort({ listed_at: -1 }).exec();
  }

  /**
   * Simple findAll without parameters for controller compatibility
   */
  async findAllProperties(): Promise<PropertyDocument[]> {
    return this.findAll();
  }

  /**
   * Find a property by ID
   */
  async findOne(id: string): Promise<PropertyDocument> {
    const property = await this.propertyModel
      .findById(id)
      .where({ is_active: true })
      .exec();
    
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    
    return property;
  }

  /**
   * Find a property by ID (alias method)
   */
  async findById(id: string): Promise<PropertyDocument> {
    return this.findOne(id);
  }

  async findByBlockchainId(blockchainId: number): Promise<PropertyDocument> {
    const property = await this.propertyModel
      .findOne({ blockchain_id: blockchainId, is_active: true })
      .exec();
    
    if (!property) {
      throw new NotFoundException(`Property with blockchain ID ${blockchainId} not found`);
    }
    
    return property;
  }

  /**
   * Update a property
   */
  async update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<PropertyDocument> {
    const property = await this.propertyModel
      .findByIdAndUpdate(
        id,
        { ...updatePropertyDto, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
      .where({ is_active: true })
      .exec();

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  /**
   * Update a property (alias method)
   */
  async updateProperty(id: string, updatePropertyDto: UpdatePropertyDto): Promise<PropertyDocument> {
    return this.update(id, updatePropertyDto);
  }

  /**
   * Delete/Remove a property (alias method)
   */
  async deleteProperty(id: string): Promise<void> {
    return this.remove(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.propertyModel
      .findByIdAndUpdate(
        id,
        { is_active: false, updatedAt: new Date() },
        { new: true }
      )
      .exec();

    if (!result) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
  }

  /**
   * Get properties by owner address
   */
  async findByOwner(ownerAddress: string): Promise<PropertyDocument[]> {
    return await this.propertyModel
      .find({ 
        owner_address: ownerAddress.toLowerCase(),
        is_active: true 
      })
      .sort({ listed_at: -1 })
      .exec();
  }

  /**
   * Get properties by tenant address
   */
  async findByTenant(tenantAddress: string): Promise<PropertyDocument[]> {
    return await this.propertyModel
      .find({ 
        tenant_address: tenantAddress.toLowerCase(),
        is_active: true 
      })
      .sort({ booked_at: -1 })
      .exec();
  }

  /**
   * Get available properties only with pagination
   */
  async findAvailable(page: number = 1, limit: number = 10): Promise<PropertyDocument[]> {
    const skip = (page - 1) * limit;
    
    return await this.propertyModel
      .find({ 
        status: PropertyStatus.AVAILABLE,
        is_active: true 
      })
      .sort({ listed_at: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  /**
   * Book a property and execute blockchain transaction
   */
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

      console.log('Booking property:', {
        propertyId,
        blockchainId: property.blockchain_id,
        durationMonths: bookPropertyDto.duration_months,
        tenantAddress
      });

      // Execute blockchain transaction
      const transactionResult = await this.starknetService.bookProperty(
        property.blockchain_id,
        bookPropertyDto.duration_months
      );

      console.log('Blockchain booking transaction completed:', transactionResult);

      if (transactionResult.status !== 'success') {
        throw new Error('Blockchain transaction failed');
      }

      // Update database after successful blockchain transaction
      const startDate = bookPropertyDto.lease_start_date || new Date();
      const leaseEndDate = new Date(startDate);
      leaseEndDate.setMonth(leaseEndDate.getMonth() + bookPropertyDto.duration_months);

      const updatedProperty = await this.propertyModel
        .findByIdAndUpdate(
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
        )
        .exec();

      if (!updatedProperty) {
        throw new NotFoundException(`Property with ID ${propertyId} not found`);
      }

      console.log('Property booking saved to database');
      return updatedProperty;
    } catch (error) {
      console.error('Failed to book property:', error);
      throw new BadRequestException(`Failed to book property: ${error.message}`);
    }
  }

  /**
   * Pay rent for a property and execute blockchain transaction
   */
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

      console.log('Paying rent for property:', {
        propertyId: payRentDto.property_id,
        blockchainId: property.blockchain_id,
        amount: payRentDto.amount,
        tenantAddress
      });

      // Execute blockchain transaction
      const transactionResult = await this.starknetService.payRent(
        property.blockchain_id,
        payRentDto.amount
      );

      console.log('Blockchain rent payment transaction completed:', transactionResult);

      if (transactionResult.status !== 'success') {
        throw new Error('Blockchain transaction failed');
      }

      // Here you could save payment record to a payments collection
      // For now, just return success with transaction details

      return {
        success: true,
        transaction_hash: transactionResult.transaction_hash,
        property: property
      };
    } catch (error) {
      console.error('Failed to pay rent:', error);
      throw new BadRequestException(`Failed to pay rent: ${error.message}`);
    }
  }

  /**
   * Get property bookings
   */
  async getPropertyBookings(propertyId: string): Promise<any[]> {
    const property = await this.findOne(propertyId);
    
    if (property.status === PropertyStatus.BOOKED && property.tenant_address) {
      return [{
        property_id: propertyId,
        tenant_address: property.tenant_address,
        owner_address: property.owner_address,
        rent_per_month: property.rent_per_month,
        lease_duration_months: property.lease_duration_months,
        lease_end_date: property.lease_end_date,
        booked_at: property.booked_at,
        status: 'active'
      }];
    }

    return [];
  }

  /**
   * Get property payments
   */
  async getPropertyPayments(propertyId: string): Promise<any[]> {
    // This would integrate with a payment service
    // For now, return empty array
    return [];
  }

  /**
   * Get tenant payments
   */
  async getTenantPayments(tenantAddress: string): Promise<any[]> {
    // This would integrate with a payment service
    // For now, return empty array
    return [];
  }

  /**
   * Sync property data with blockchain
   */
  async syncWithBlockchain(blockchainId: number): Promise<PropertyDocument> {
    try {
      // Get property data from blockchain
      const blockchainData = await this.starknetService.getProperty(blockchainId);
      
      // Update local database
      const property = await this.propertyModel
        .findOneAndUpdate(
          { blockchain_id: blockchainId },
          {
            owner_address: blockchainData.owner.toLowerCase(),
            tenant_address: blockchainData.tenant.toLowerCase() || null,
            rent_per_month: parseInt(blockchainData.rent_per_month),
            status: blockchainData.is_available ? PropertyStatus.AVAILABLE : PropertyStatus.BOOKED
          },
          { new: true }
        )
        .exec();

      if (!property) {
        throw new NotFoundException(`Property with blockchain ID ${blockchainId} not found in database`);
      }

      return property;
    } catch (error) {
      throw new Error(`Failed to sync property with blockchain: ${error.message}`);
    }
  }

  /**
   * Sync property from blockchain (alias method)
   */
  async syncFromBlockchain(blockchainId: number): Promise<PropertyDocument> {
    return this.syncWithBlockchain(blockchainId);
  }

  /**
   * Get property statistics
   */
  async getStats(): Promise<{
    total: number;
    available: number;
    booked: number;
    maintenance: number;
  }> {
    const [total, available, booked, maintenance] = await Promise.all([
      this.propertyModel.countDocuments({ is_active: true }),
      this.propertyModel.countDocuments({ status: PropertyStatus.AVAILABLE, is_active: true }),
      this.propertyModel.countDocuments({ status: PropertyStatus.BOOKED, is_active: true }),
      this.propertyModel.countDocuments({ status: PropertyStatus.MAINTENANCE, is_active: true }),
    ]);

    return { total, available, booked, maintenance };
  }

  /**
   * Check transaction status
   */
  async checkTransactionStatus(transactionHash: string): Promise<TransactionResult> {
    return this.starknetService.checkTransactionStatus(transactionHash);
  }

  // LEGACY METHODS (for backward compatibility if needed)
  /**
   * Prepare property listing transaction for frontend execution
   * @deprecated Use create() instead for direct execution
   */
  async preparePropertyListing(createPropertyDto: CreatePropertyDto, ownerAddress: string) {
    const transactionData = this.starknetService.prepareListPropertyTransaction(
      createPropertyDto.rent_per_month,
      createPropertyDto.description
    );

    return {
      transactionData,
      contractInfo: this.starknetService.getContractInfo(),
      ownerAddress
    };
  }

  /**
   * Save property after successful blockchain transaction
   * @deprecated Use create() instead for direct execution
   */
  async saveAfterBlockchainTransaction(
    createPropertyDto: CreatePropertyDto,
    transactionHash: string,
    blockchainPropertyId: number,
    ownerAddress: string
  ): Promise<PropertyDocument> {
    try {
      const property = new this.propertyModel({
        ...createPropertyDto,
        owner_address: ownerAddress.toLowerCase(),
        blockchain_id: blockchainPropertyId,
        transaction_hash: transactionHash,
        status: PropertyStatus.AVAILABLE,
        listed_at: new Date(),
        is_active: true
      });

      return await property.save();
    } catch (error) {
      throw new Error(`Failed to save property: ${(error as Error).message}`);
    }
  }
}