import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { StarknetPaymentAdapter } from './adapters/starknet-payment.adapter';
import { User } from '../auth/entities/auth.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel('Transaction') private paymentModel: Model<Transaction>,
    private starknetAdapter: StarknetPaymentAdapter,
  ) {}

  /**
   * Prepares an initial payment transaction for frontend execution
   */
  async prepareInitialPayment(bookingId: string, walletAddress: string, amount?: number) {
    try {
      // Get expected amount if not provided
      const paymentAmount = amount || await this.getExpectedPaymentAmount(bookingId, 'initial');
      
      // Prepare payment transaction through adapter
      const transactionPrep = await this.starknetAdapter.preparePayment(
        bookingId,
        paymentAmount
      );

      if (!transactionPrep.success) {
        throw new Error(transactionPrep.error || 'Failed to prepare payment transaction');
      }

      // Create a pending payment record
      const payment = new this.paymentModel({
        booking: bookingId,
        amount: paymentAmount,
        type: 'initial',
        status: 'pending', // Changed from 'completed' since transaction isn't executed yet
        walletAddress: walletAddress,
      });

      const savedPayment = await payment.save();

      return {
        payment: savedPayment,
        transaction: transactionPrep.transaction,
        contractInfo: this.starknetAdapter.getContractInfo()
      };
    } catch (error) {
      throw new Error(`Failed to prepare initial payment: ${error.message}`);
    }
  }

  /**
   * Prepares a rent payment transaction for frontend execution
   */
  async prepareRentPayment(bookingId: string, amount: number, user: User) {
    try {
      const transactionPrep = await this.starknetAdapter.prepareRentPayment(
        bookingId,
        amount
      );

      if (!transactionPrep.success) {
        throw new Error(transactionPrep.error || 'Failed to prepare rent payment transaction');
      }

      // Create a pending payment record
      const payment = new this.paymentModel({
        booking: bookingId,
        amount,
        type: 'rent',
        status: 'pending', // Will be updated when transaction is confirmed
        paidBy: user._id,
        walletAddress: user.walletAddress,
      });

      const savedPayment = await payment.save();

      return {
        payment: savedPayment,
        transaction: transactionPrep.transaction,
        contractInfo: this.starknetAdapter.getContractInfo(),
        propertyDetails: transactionPrep.property_details
      };
    } catch (error) {
      throw new Error(`Failed to prepare rent payment: ${error.message}`);
    }
  }

  /**
   * Confirms a payment after successful blockchain transaction
   */
  async confirmPayment(paymentId: string, transactionHash: string) {
    try {
      const payment = await this.paymentModel.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Update payment with transaction hash and mark as completed
      Object.assign(payment, {
        starknetTxHash: transactionHash,
        status: 'completed',
        confirmedAt: new Date()
      });

      return payment.save();
    } catch (error) {
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }

  /**
   * Marks a payment as failed
   */
  async markPaymentFailed(paymentId: string, reason?: string) {
    try {
      const payment = await this.paymentModel.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      Object.assign(payment, {
        status: 'failed',
        failureReason: reason,
        failedAt: new Date()
      });

      return payment.save();
    } catch (error) {
      throw new Error(`Failed to mark payment as failed: ${error.message}`);
    }
  }

  async getPaymentHistory(bookingId: string, user: User) {
    try {
      return this.paymentModel
        .find({ booking: bookingId })
        .populate('booking')
        .sort({ createdAt: -1 }) // Most recent first
        .exec();
    } catch (error) {
      throw new Error(`Failed to get payment history: ${error.message}`);
    }
  }

  async processRefund(paymentId: string, user: User | null) {
    // Handle null user case
    if (!user) {
      throw new Error('User authentication required for refund processing');
    }

    try {
      const payment = await this.paymentModel.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Validate that the payment can be refunded
      if (payment.status !== TransactionStatus.CONFIRMED) {
        throw new Error('Only confirmed payments can be refunded');
      }

      // Process refund logic here
      Object.assign(payment, {
        status: 'refunded',
        refundedAt: new Date(),
        refundedBy: user._id
      });

      return payment.save();
    } catch (error) {
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  async generatePaymentReport(bookingId: string) {
    try {
      const payments = await this.paymentModel
        .find({ booking: bookingId })
        .sort({ createdAt: -1 })
        .exec();

      // Calculate totals and summary
      const summary = {
        totalPaid: payments
          .filter(p => p.status === TransactionStatus.CONFIRMED)
          .reduce((sum: number, p) => sum + Number(p.amount), 0),
        totalPending: payments
          .filter(p => p.status === TransactionStatus.PENDING)
          .reduce((sum: number, p) => sum + Number(p.amount), 0),
        totalRefunded: payments
          .filter(p => p.status === TransactionStatus.FAILED)
          .reduce((sum: number, p) => sum + Number(p.amount), 0),
        transactionCount: payments.length,
        completedCount: payments.filter(p => p.status === TransactionStatus.CONFIRMED).length,
        pendingCount: payments.filter(p => p.status === TransactionStatus.PENDING).length,
        failedCount: payments.filter(p => p.status === TransactionStatus.FAILED).length
      };

      return {
        payments,
        summary,
        bookingId,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to generate payment report: ${error.message}`);
    }
  }

  // Methods that the controller expects - updated for new architecture
  async payDeposit(bookingId: string, amount: number, user: User) {
    return this.prepareInitialPayment(bookingId, user.walletAddress, amount);
  }

  async payRent(bookingId: string, amount: number, user: User) {
    return this.prepareRentPayment(bookingId, amount, user);
  }

  /**
   * Gets the expected payment amount for a booking
   * This is a placeholder - you should implement based on your booking logic
   */
  private async getExpectedPaymentAmount(bookingId: string, type: 'initial' | 'rent'): Promise<number> {
    // This should fetch the actual amount from your booking/property data
    // For now, returning a default amount
    try {
      if (type === 'initial') {
        // Could be deposit amount from booking
        return 1000; // Default deposit amount
      } else {
        // Could be monthly rent from property/booking
        const rentInfo = await this.starknetAdapter.getExpectedRent(bookingId);
        return Number(rentInfo.rent_per_month);
      }
    } catch (error) {
      // Fallback to default amounts
      return type === 'initial' ? 1000 : 500;
    }
  }

  /**
   * Validates a property/booking for payment
   */
  async validatePayment(bookingId: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const validation = await this.starknetAdapter.validateProperty(bookingId);
      return validation;
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Gets contract information for frontend wallet integration
   */
  getContractInfo() {
    return this.starknetAdapter.getContractInfo();
  }
}