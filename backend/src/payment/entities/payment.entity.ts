// src/payment/entities/payment.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;
export type TransactionDocument = Transaction & Document;

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum PaymentType {
  RENT = 'rent',
  DEPOSIT = 'deposit',
  REFUND = 'refund',
  PENALTY = 'penalty'
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

@Schema({ 
  timestamps: true,
  collection: 'payments'
})
export class Payment {
  @Prop({ required: true })
  property_id: string; // Reference to Property document

  @Prop({ required: true })
  blockchain_property_id: number; // The blockchain ID

  @Prop({ required: true })
  from_address: string; // Tenant's wallet address

  @Prop({ required: true })
  to_address: string; // Owner's wallet address

  @Prop({ required: true })
  amount: number; // Amount in USDT (smallest unit)

  @Prop({ 
    type: String, 
    enum: PaymentType,
    required: true 
  })
  payment_type: PaymentType;

  @Prop({ 
    type: String, 
    enum: PaymentStatus,
    default: PaymentStatus.PENDING 
  })
  status: PaymentStatus;

  @Prop({ required: true })
  transaction_hash: string; // StarkNet transaction hash

  @Prop({ default: null })
  block_number: number;

  @Prop({ default: null })
  block_hash: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: null })
  confirmed_at: Date;

  @Prop({ default: null })
  failed_at: Date;

  @Prop({ required: false })
  failure_reason: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  // For recurring rent payments
  @Prop({ default: null })
  payment_period_start: Date;

  @Prop({ default: null })
  payment_period_end: Date;

  @Prop({ default: false })
  is_late_payment: boolean;

  @Prop({ default: null })
  due_date: Date;

  @Prop({ default: 0 })
  late_fee: number;
}

@Schema({ 
  timestamps: true,
  collection: 'transactions'
})
export class Transaction {
  @Prop({ required: true, unique: true })
  hash: string; // StarkNet transaction hash

  @Prop({ required: true })
  from_address: string;

  @Prop({ required: true })
  to_address: string;

  @Prop({ required: true })
  amount: string; // Amount as string to preserve precision

  @Prop({ required: true })
  contract_address: string; // USDT contract address

  @Prop({ 
    type: String, 
    enum: TransactionStatus,
    default: TransactionStatus.PENDING 
  })
  status: TransactionStatus;

  @Prop({ default: null })
  block_number: number;

  @Prop({ default: null })
  block_hash: string;

  @Prop({ default: null })
  block_timestamp: Date;

  @Prop({ default: 0 })
  gas_used: number;

  @Prop({ default: '0' })
  gas_price: string;

  @Prop({ default: '0' })
  transaction_fee: string;

  @Prop({ default: null })
  failure_reason: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: null })
  confirmed_at: Date;

  @Prop({ default: null })
  failed_at: Date;

  // Link to payment if this transaction is for a payment
  @Prop({ type: Types.ObjectId, ref: 'Payment', default: null })
  payment_id: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  raw_transaction_data: Record<string, any>;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
