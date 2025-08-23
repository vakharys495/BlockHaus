import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Property', required: true })
  property_id: Types.ObjectId;

  @Prop({ required: true })
  blockchain_property_id: number;

  @Prop({ required: true })
  tenant_address: string;

  @Prop({ required: true })
  owner_address: string;

  @Prop({ required: true })
  duration_months: number;

  @Prop({ required: true })
  rent_per_month: number;

  @Prop({ required: true })
  total_amount: number;

  @Prop({ 
    type: String, 
    enum: BookingStatus, 
    default: BookingStatus.PENDING 
  })
  status: BookingStatus;

  @Prop({ required: false })
  transaction_hash?: string;

  @Prop({ required: true })
  booking_date: Date;

  @Prop({ required: true })
  lease_start_date: Date;

  @Prop({ required: true })
  lease_end_date: Date;

  @Prop({ required: false })
  message?: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
export type BookingDocument = Booking & Document;