import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PropertyService } from '../property/property.service';
import { StarknetService } from '../common/integrations/starknet/starknet.service';
import { PropertyStatus } from '../property/entities/property.entity';
import { User } from '../auth/entities/auth.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingDocument, BookingStatus } from './entities/booking.entity';

// Define the booking request interface locally since it's not exported from StarknetService
interface BookingRequestData {
  property_id: number;
  tenant_address: string;
  duration_months: number;
  message?: string;
}

@Injectable()
export class BookingService {
  constructor(
    @InjectModel('Booking') private bookingModel: Model<BookingDocument>,
    private readonly propertyService: PropertyService,
    private readonly starknetService: StarknetService
  ) {}

  /**
   * Create a new booking request (prepares transaction for frontend execution)
   */
  async create(createBookingDto: CreateBookingDto, user: User): Promise<any> {
    try {
      // First, find the property to ensure it exists and is available
      const property = await this.propertyService.findOne(createBookingDto.property_id);
      
      if (property.status !== PropertyStatus.AVAILABLE) {
        throw new BadRequestException('Property is not available for booking');
      }

      // Use the correct property ID access
      const propertyId = (property as any)._id?.toString() || property.id;

      // Calculate lease end date
      const leaseEndDate = new Date(createBookingDto.lease_start_date);
      leaseEndDate.setMonth(leaseEndDate.getMonth() + createBookingDto.duration_months);

      // Calculate total amount
      const totalAmount = property.rent_per_month * createBookingDto.duration_months;

      // Prepare booking transaction for blockchain
      const bookingTransaction = this.starknetService.prepareBookPropertyTransaction(
        property.blockchain_id,
        createBookingDto.duration_months
      );

      // Create booking record in database with pending status
      const booking = new this.bookingModel({
        property_id: propertyId,
        blockchain_property_id: property.blockchain_id,
        tenant_address: createBookingDto.tenant_address.toLowerCase(),
        owner_address: property.owner_address,
        duration_months: createBookingDto.duration_months,
        rent_per_month: property.rent_per_month,
        total_amount: totalAmount,
        status: BookingStatus.PENDING,
        booking_date: new Date(),
        lease_start_date: createBookingDto.lease_start_date,
        lease_end_date: leaseEndDate,
        message: createBookingDto.message,
        created_at: new Date(),
        updated_at: new Date()
      });

      const savedBooking = await booking.save();

      // Update property status to reflect pending booking
      await this.propertyService.update(propertyId, {
        status: PropertyStatus.BOOKED
      });

      return {
        booking: savedBooking,
        transaction: bookingTransaction,
        contractInfo: this.starknetService.getContractInfo(),
        message: 'Booking transaction prepared successfully. Please execute the transaction using your wallet.'
      };

    } catch (error) {
      throw new Error(`Failed to create booking: ${(error as Error).message}`);
    }
  }

  /**
   * Confirms a booking after successful blockchain transaction
   */
  async confirmBooking(bookingId: string, transactionHash: string, user?: User): Promise<any> {
    try {
      const booking = await this.bookingModel.findById(bookingId).exec();
      
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // Verify user has permission to confirm this booking (optional security check)
      if (user && booking.tenant_address.toLowerCase() !== user.walletAddress?.toLowerCase()) {
        throw new ForbiddenException('You can only confirm your own bookings');
      }

      const updatedBooking = await this.bookingModel.findByIdAndUpdate(
        bookingId,
        {
          status: BookingStatus.CONFIRMED,
          transaction_hash: transactionHash,
          confirmed_at: new Date(),
          updated_at: new Date()
        },
        { new: true }
      ).populate('property_id').exec();

      // Update property status to confirmed booking
      await this.propertyService.update(booking.property_id.toString(), {
        status: PropertyStatus.BOOKED
      });

      return {
        message: 'Booking confirmed successfully',
        booking: updatedBooking,
        transaction_hash: transactionHash
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error(`Failed to confirm booking: ${(error as Error).message}`);
    }
  }

  /**
   * Marks a booking as failed after unsuccessful blockchain transaction
   */
  async markBookingFailed(bookingId: string, reason?: string, user?: User): Promise<any> {
    try {
      const booking = await this.bookingModel.findById(bookingId).exec();
      
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // Verify user has permission (optional security check)
      if (user && booking.tenant_address.toLowerCase() !== user.walletAddress?.toLowerCase()) {
        throw new ForbiddenException('You can only update your own bookings');
      }

      const updatedBooking = await this.bookingModel.findByIdAndUpdate(
        bookingId,
        {
          status: BookingStatus.CANCELLED,
          failure_reason: reason,
          failed_at: new Date(),
          updated_at: new Date()
        },
        { new: true }
      ).populate('property_id').exec();

      // Revert property status back to available
      await this.propertyService.update(booking.property_id.toString(), {
        status: PropertyStatus.AVAILABLE
      });

      return {
        message: 'Booking marked as failed',
        booking: updatedBooking,
        reason
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error(`Failed to mark booking as failed: ${(error as Error).message}`);
    }
  }

  /**
   * Find all bookings for the authenticated user
   */
  async findAll(user: User, status?: string): Promise<any[]> {
    try {
      const query: any = {
        $or: [
          { tenant_address: user.walletAddress?.toLowerCase() },
          { owner_address: user.walletAddress?.toLowerCase() }
        ]
      };

      if (status) {
        query.status = status;
      }

      return await this.bookingModel
        .find(query)
        .populate('property_id')
        .sort({ created_at: -1 })
        .exec();
    } catch (error) {
      throw new Error(`Failed to get bookings: ${(error as Error).message}`);
    }
  }

  /**
   * Find a specific booking by ID
   */
  async findOne(id: string, user: User): Promise<any> {
    try {
      const booking = await this.bookingModel
        .findById(id)
        .populate('property_id')
        .exec();

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // Check if user has access to this booking
      if (
        booking.tenant_address.toLowerCase() !== user.walletAddress?.toLowerCase() &&
        booking.owner_address.toLowerCase() !== user.walletAddress?.toLowerCase()
      ) {
        throw new ForbiddenException('You do not have access to this booking');
      }

      return booking;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error(`Failed to get booking: ${(error as Error).message}`);
    }
  }

  /**
   * Update a booking
   */
  async update(id: string, updateBookingDto: UpdateBookingDto, user: User): Promise<any> {
    try {
      const booking = await this.bookingModel.findById(id).exec();
      
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // Check if user has permission to update this booking
      // Typically, only the property owner can confirm/update bookings
      if (booking.owner_address.toLowerCase() !== user.walletAddress?.toLowerCase()) {
        throw new ForbiddenException('You do not have permission to update this booking');
      }

      const updatedBooking = await this.bookingModel.findByIdAndUpdate(
        id,
        {
          ...updateBookingDto,
          updated_at: new Date()
        },
        { new: true }
      ).populate('property_id').exec();

      // If booking is being confirmed or cancelled, update property status
      if (updateBookingDto.status) {
        let propertyStatus: PropertyStatus;
        
        switch (updateBookingDto.status) {
          case BookingStatus.CONFIRMED:
            propertyStatus = PropertyStatus.BOOKED;
            break;
          case BookingStatus.CANCELLED:
          case BookingStatus.EXPIRED:
            propertyStatus = PropertyStatus.AVAILABLE;
            break;
          default:
            propertyStatus = PropertyStatus.AVAILABLE;
        }

        await this.propertyService.update(booking.property_id.toString(), {
          status: propertyStatus
        });
      }

      return {
        message: 'Booking updated successfully',
        booking: updatedBooking
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error(`Failed to update booking: ${(error as Error).message}`);
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, reason?: string, user?: User): Promise<any> {
    try {
      const booking = await this.bookingModel.findById(bookingId).exec();
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // Optional: Check if user has permission to cancel
      if (user && 
          booking.tenant_address.toLowerCase() !== user.walletAddress?.toLowerCase() &&
          booking.owner_address.toLowerCase() !== user.walletAddress?.toLowerCase()) {
        throw new ForbiddenException('You do not have permission to cancel this booking');
      }

      // Update booking status
      const updatedBooking = await this.bookingModel.findByIdAndUpdate(
        bookingId,
        {
          status: BookingStatus.CANCELLED,
          cancellation_reason: reason,
          cancelled_at: new Date(),
          updated_at: new Date()
        },
        { new: true }
      ).exec();

      // Revert property status back to AVAILABLE
      await this.propertyService.update(booking.property_id.toString(), {
        status: PropertyStatus.AVAILABLE
      });

      return {
        message: 'Booking cancelled successfully',
        booking: updatedBooking,
        reason
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error(`Failed to cancel booking: ${(error as Error).message}`);
    }
  }

  /**
   * Get bookings by tenant address
   */
  async getBookingsByTenant(tenantAddress: string): Promise<any[]> {
    try {
      return await this.bookingModel
        .find({ tenant_address: tenantAddress.toLowerCase() })
        .populate('property_id')
        .sort({ created_at: -1 })
        .exec();
    } catch (error) {
      throw new Error(`Failed to get tenant bookings: ${(error as Error).message}`);
    }
  }

  /**
   * Get bookings by owner address
   */
  async getBookingsByOwner(ownerAddress: string): Promise<any[]> {
    try {
      return await this.bookingModel
        .find({ owner_address: ownerAddress.toLowerCase() })
        .populate('property_id')
        .sort({ created_at: -1 })
        .exec();
    } catch (error) {
      throw new Error(`Failed to get owner bookings: ${(error as Error).message}`);
    }
  }

  /**
   * Get booking by property ID
   */
  async getBookingByProperty(propertyId: string): Promise<any> {
    try {
      const booking = await this.bookingModel
        .findOne({ property_id: propertyId, status: BookingStatus.CONFIRMED })
        .populate('property_id')
        .exec();

      if (!booking) {
        throw new NotFoundException('No active booking found for this property');
      }

      return booking;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to get property booking: ${(error as Error).message}`);
    }
  }

  /**
   * Check if a booking is expired
   */
  async checkExpiredBookings(): Promise<any[]> {
    try {
      const now = new Date();
      
      const expiredBookings = await this.bookingModel
        .find({
          status: BookingStatus.CONFIRMED,
          lease_end_date: { $lt: now }
        })
        .exec();

      // Update expired bookings
      for (const booking of expiredBookings) {
        await this.bookingModel.findByIdAndUpdate(
          booking._id,
          {
            status: BookingStatus.EXPIRED,
            expired_at: new Date(),
            updated_at: new Date()
          }
        ).exec();

        // Update property status back to available
        await this.propertyService.update(booking.property_id.toString(), {
          status: PropertyStatus.AVAILABLE
        });
      }

      return expiredBookings;
    } catch (error) {
      throw new Error(`Failed to check expired bookings: ${(error as Error).message}`);
    }
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(): Promise<{
    total_bookings: number;
    active_bookings: number;
    pending_bookings: number;
    cancelled_bookings: number;
    expired_bookings: number;
  }> {
    try {
      const [total, active, pending, cancelled, expired] = await Promise.all([
        this.bookingModel.countDocuments(),
        this.bookingModel.countDocuments({ status: BookingStatus.CONFIRMED }),
        this.bookingModel.countDocuments({ status: BookingStatus.PENDING }),
        this.bookingModel.countDocuments({ status: BookingStatus.CANCELLED }),
        this.bookingModel.countDocuments({ status: BookingStatus.EXPIRED })
      ]);

      return {
        total_bookings: total,
        active_bookings: active,
        pending_bookings: pending,
        cancelled_bookings: cancelled,
        expired_bookings: expired
      };
    } catch (error) {
      throw new Error(`Failed to get booking statistics: ${(error as Error).message}`);
    }
  }

  /**
   * Validates a property for booking
   */
  async validatePropertyForBooking(propertyId: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const property = await this.propertyService.findOne(propertyId);
      
      if (property.status !== PropertyStatus.AVAILABLE) {
        return {
          valid: false,
          error: 'Property is not available for booking'
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Property validation failed: ${error.message}`
      };
    }
  }

  /**
   * Gets contract information for frontend wallet integration
   */
  getContractInfo() {
    return this.starknetService.getContractInfo();
  }

  /**
   * Prepares a booking transaction without creating a database record
   * Useful for transaction preview
   */
  async prepareBookingTransaction(propertyId: string, durationMonths: number): Promise<any> {
    try {
      const property = await this.propertyService.findOne(propertyId);
      
      if (property.status !== PropertyStatus.AVAILABLE) {
        throw new BadRequestException('Property is not available for booking');
      }

      const transaction = this.starknetService.prepareBookPropertyTransaction(
        property.blockchain_id,
        durationMonths
      );

      return {
        transaction,
        contractInfo: this.starknetService.getContractInfo(),
        estimatedCost: property.rent_per_month * durationMonths,
        property: {
          id: property.id,
          blockchain_id: property.blockchain_id,
          rent_per_month: property.rent_per_month,
          owner_address: property.owner_address
        }
      };
    } catch (error) {
      throw new Error(`Failed to prepare booking transaction: ${error.message}`);
    }
  }
}