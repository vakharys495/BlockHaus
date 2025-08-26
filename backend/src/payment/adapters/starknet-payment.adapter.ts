// src/common/integrations/starknet/starknet-payment.adapter.ts
import { Injectable } from '@nestjs/common';
import { StarknetService, TransactionResult } from '../../common/integrations/starknet/starknet.service';

@Injectable()
export class StarknetPaymentAdapter {
  constructor(private readonly starknetService: StarknetService) {}

  /**
   * Prepares a payment transaction for a booking
   */
  async preparePayment(propertyId: string | number, amount: number): Promise<any> {
    const numericPropertyId = Number(propertyId);

    if (isNaN(numericPropertyId)) {
      throw new Error(`Invalid propertyId: ${propertyId}`);
    }

    if (amount <= 0) {
      throw new Error(`Invalid amount: ${amount}. Amount must be greater than 0`);
    }

    try {
      const property = await this.starknetService.getProperty(numericPropertyId);
      if (!property) {
        throw new Error(`Property with ID ${propertyId} not found`);
      }

      const amountUint256 = this.starknetService.numberToUint256(amount);

      return {
        property_id: numericPropertyId,
        amount: amount,
        amount_uint256: amountUint256,
        owner_address: property.owner,
        estimated_gas_fee: '0', // Placeholder: Implement gas estimation if needed
      };
    } catch (error) {
      throw new Error(`Failed to prepare payment: ${(error as Error).message}`);
    }
  }

  /**
   * Prepares a rent payment transaction
   */
  async prepareRentPayment(propertyId: string | number, amount: number): Promise<any> {
    const numericPropertyId = Number(propertyId);

    if (isNaN(numericPropertyId)) {
      throw new Error(`Invalid propertyId: ${propertyId}`);
    }

    if (amount <= 0) {
      throw new Error(`Invalid amount: ${amount}. Amount must be greater than 0`);
    }

    try {
      const property = await this.starknetService.getProperty(numericPropertyId);
      if (!property) {
        throw new Error(`Property with ID ${propertyId} not found`);
      }

      if (property.is_available) {
        throw new Error(`Property ${propertyId} is not currently rented`);
      }

      if (!property.tenant) {
        throw new Error(`No tenant assigned to property ${propertyId}`);
      }

      const expectedRent = Number(property.rent_per_month);
      if (amount !== expectedRent) {
        console.warn(
          `⚠️ Payment amount (${amount}) differs from expected rent (${expectedRent})`,
        );
      }

      const amountUint256 = this.starknetService.numberToUint256(amount);

      return {
        property_id: numericPropertyId,
        amount: amount,
        amount_uint256: amountUint256,
        tenant_address: property.tenant,
        owner_address: property.owner,
        estimated_gas_fee: '0', // Placeholder: Implement gas estimation if needed
      };
    } catch (error) {
      throw new Error(`Failed to prepare rent payment: ${(error as Error).message}`);
    }
  }

  /**
   * Executes a rent payment transaction on Starknet
   */
  async executePayment(propertyId: string | number, amount: number): Promise<TransactionResult> {
    const numericPropertyId = Number(propertyId);

    if (isNaN(numericPropertyId)) {
      throw new Error(`Invalid propertyId: ${propertyId}`);
    }

    if (amount <= 0) {
      throw new Error(`Invalid amount: ${amount}. Amount must be greater than 0`);
    }

    try {
      const transactionResult = await this.starknetService.payRent(
        numericPropertyId,
        amount,
      );

      return {
        ...transactionResult,
        property_id: numericPropertyId,
      };
    } catch (error) {
      throw new Error(`Failed to execute payment: ${(error as Error).message}`);
    }
  }

  /**
   * Executes a rent payment with validation
   */
  async executeRentPayment(
    propertyId: string | number,
    amount: number,
    additionalData?: any,
  ) {
    const numericPropertyId = Number(propertyId);

    try {
      // Validate property exists
      const property = await this.starknetService.getProperty(numericPropertyId);

      if (!property) {
        throw new Error(`Property with ID ${propertyId} not found`);
      }

      if (property.is_available) {
        throw new Error(`Property ${propertyId} is not currently rented`);
      }

      // Validate rent matches expected
      const expectedRent = Number(property.rent_per_month);
      if (amount !== expectedRent) {
        console.warn(
          `⚠️ Payment amount (${amount}) differs from expected rent (${expectedRent})`,
        );
      }

      const transactionResult = await this.executePayment(
        numericPropertyId,
        amount,
      );

      return {
        success: true,
        transaction: transactionResult,
        property_details: {
          owner: property.owner,
          tenant: property.tenant,
          rent_per_month: property.rent_per_month,
          description: property.description,
        },
        ...additionalData,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        property_id: numericPropertyId,
        amount,
        executed_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Gets contract information for frontend display
   */
  getContractInfo() {
    return this.starknetService.getContractInfo();
  }

  /**
   * Validates a property exists and returns its details
   */
  async validateProperty(propertyId: string | number) {
    const numericPropertyId = Number(propertyId);

    if (isNaN(numericPropertyId)) {
      return {
        valid: false,
        error: `Invalid propertyId: ${propertyId}`,
        property_id: propertyId,
      };
    }

    try {
      const property = await this.starknetService.getProperty(numericPropertyId);
      return {
        valid: true,
        property,
        property_id: numericPropertyId,
      };
    } catch (error) {
      return {
        valid: false,
        error: (error as Error).message,
        property_id: numericPropertyId,
      };
    }
  }

  /**
   * Gets the expected rent amount for a property
   */
  async getExpectedRent(propertyId: string | number) {
    const validation = await this.validateProperty(propertyId);

    if (!validation.valid || !validation.property) {
      throw new Error(validation.error || 'Property not found');
    }

    return {
      property_id: validation.property_id,
      rent_per_month: validation.property.rent_per_month,
      is_available: validation.property.is_available,
      owner: validation.property.owner,
      tenant: validation.property.tenant,
    };
  }
}