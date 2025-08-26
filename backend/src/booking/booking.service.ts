// src/booking/booking.service.ts
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

@Injectable()
export class BookingService {
  constructor(
    @InjectModel('Booking') private bookingModel: Model<BookingDocument>,
    private readonly propertyService: PropertyService,
    private readonly starknetService: StarknetService,
  ) {}

  /**
   * Create a new booking (executes transaction on-chain and persists in DB)
   */
  async create(createBookingDto: CreateBookingDto, user: User): Promise<any> {
    try {
      const property = await this.propertyService.findOne(createBookingDto.property_id);

      if (property.status !== PropertyStatus.AVAILABLE) {
        throw new BadRequestException('Property is not available for booking');
      }

      const propertyId = (property as any)._id?.toString() || property.id;

      // Lease calculations
      const leaseEndDate = new Date(createBookingDto.lease_start_date);
      leaseEndDate.setMonth(leaseEndDate.getMonth() + createBookingDto.duration_months);
      const totalAmount = property.rent_per_month * createBookingDto.duration_months;

      // Execute booking transaction on Starknet
      const transactionResult = await this.starknetService.bookProperty(
        property.blockchain_id,
        createBookingDto.duration_months,
      );

      if (transactionResult.status !== 'success') {
        throw new Error('Blockchain booking transaction failed');
      }

      // Save booking in DB
      const booking = new this.bookingModel({
        property_id: propertyId,
        blockchain_property_id: property.blockchain_id,
        tenant_address: createBookingDto.tenant_address.toLowerCase(),
        owner_address: property.owner_address,
        duration_months: createBookingDto.duration_months,
        rent_per_month: property.rent_per_month,
        total_amount: totalAmount,
        status: BookingStatus.CONFIRMED,
        booking_date: new Date(),
        lease_start_date: createBookingDto.lease_start_date,
        lease_end_date: leaseEndDate,
        message: createBookingDto.message,
        transaction_hash: transactionResult.transaction_hash,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const savedBooking = await booking.save();

      // Update property status → booked
      await this.propertyService.update(propertyId, {
        status: PropertyStatus.BOOKED,
      });

      return {
        booking: savedBooking,
        transaction: transactionResult,
        message: 'Booking executed successfully on blockchain and saved in database.',
      };
    } catch (error) {
      throw new Error(`Failed to create booking: ${(error as Error).message}`);
    }
  }

  /**
   * Confirms a booking (if needed manually)
   */
  async confirmBooking(bookingId: string, transactionHash: string, user?: User): Promise<any> {
    try {
      const booking = await this.bookingModel.findById(bookingId).exec();
      if (!booking) throw new NotFoundException('Booking not found');

      if (user && booking.tenant_address.toLowerCase() !== user.walletAddress?.toLowerCase()) {
        throw new ForbiddenException('You can only confirm your own bookings');
      }

      const updatedBooking = await this.bookingModel.findByIdAndUpdate(
        bookingId,
        {
          status: BookingStatus.CONFIRMED,
          transaction_hash: transactionHash,
          confirmed_at: new Date(),
          updated_at: new Date(),
        },
        { new: true },
      ).populate('property_id').exec();

      await this.propertyService.update(booking.property_id.toString(), {
        status: PropertyStatus.BOOKED,
      });

      return {
        message: 'Booking confirmed successfully',
        booking: updatedBooking,
        transaction_hash: transactionHash,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      throw new Error(`Failed to confirm booking: ${(error as Error).message}`);
    }
  }

  /**
   * Get all bookings for a user with optional status filter
   */
  async findAll(user: User, status?: string): Promise<BookingDocument[]> {
    try {
      const query: any = { tenant_address: user.walletAddress.toLowerCase() };
      if (status) {
        query.status = status;
      }
      return await this.bookingModel.find(query).populate('property_id').exec();
    } catch (error) {
      throw new Error(`Failed to fetch bookings: ${(error as Error).message}`);
    }
  }

  /**
   * Get a specific booking by ID
   */
  async findOne(id: string, user: User): Promise<BookingDocument> {
    try {
      const booking = await this.bookingModel.findById(id).populate('property_id').exec();
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }
      if (booking.tenant_address.toLowerCase() !== user.walletAddress.toLowerCase()) {
        throw new ForbiddenException('You can only view your own bookings');
      }
      return booking;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      throw new Error(`Failed to fetch booking: ${(error as Error).message}`);
    }
  }

  /**
   * Update a booking (e.g., confirm or cancel)
   */
  async update(id: string, updateBookingDto: UpdateBookingDto, user: User): Promise<BookingDocument> {
    try {
      const booking = await this.bookingModel.findById(id).exec();
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }
      if (booking.tenant_address.toLowerCase() !== user.walletAddress.toLowerCase()) {
        throw new ForbiddenException('You can only update your own bookings');
      }

      const updateData: any = { updated_at: new Date() };
      if (updateBookingDto.status) {
        updateData.status = updateBookingDto.status;
        if (updateBookingDto.status === BookingStatus.CONFIRMED) {
          updateData.confirmed_at = new Date();
        } else if (updateBookingDto.status === BookingStatus.CANCELLED) {
          updateData.cancelled_at = new Date();
          // Update property status back to AVAILABLE if cancelled
          await this.propertyService.update(booking.property_id.toString(), {
            status: PropertyStatus.AVAILABLE,
          });
        }
      }

      const updatedBooking = await this.bookingModel.findByIdAndUpdate(id, updateData, { new: true })
        .populate('property_id')
        .exec();

      if (!updatedBooking) {
        throw new NotFoundException('Booking not found after update');
      }

      return updatedBooking;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      throw new Error(`Failed to update booking: ${(error as Error).message}`);
    }
  }

  /**
   * Prepares a booking transaction preview (without DB save)
   */
  async prepareBookingTransaction(propertyId: string, durationMonths: number): Promise<any> {
    try {
      const property = await this.propertyService.findOne(propertyId);
      if (property.status !== PropertyStatus.AVAILABLE) {
        throw new BadRequestException('Property is not available for booking');
      }

      return {
        estimatedCost: property.rent_per_month * durationMonths,
        property: {
          id: property.id,
          blockchain_id: property.blockchain_id,
          rent_per_month: property.rent_per_month,
          owner_address: property.owner_address,
        },
      };
    } catch (error) {
      throw new Error(`Failed to prepare booking transaction: ${error.message}`);
    }
  }
}