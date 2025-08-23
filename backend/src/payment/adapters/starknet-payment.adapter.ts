// src/modules/payment/adapters/starknet-payment.adapter.ts
import { Injectable } from '@nestjs/common';
import { StarknetService } from '../../common/integrations/starknet/starknet.service';

@Injectable()
export class StarknetPaymentAdapter {
  constructor(private readonly starknetService: StarknetService) {}

  /**
   * Prepares a payment transaction for frontend execution
   */
  async preparePayment(propertyId: string | number, amount: number) {
    // Ensure propertyId is a number before sending to Starknet
    const numericPropertyId = Number(propertyId);

    if (isNaN(numericPropertyId)) {
      throw new Error(`Invalid propertyId: ${propertyId}`);
    }

    if (amount <= 0) {
      throw new Error(`Invalid amount: ${amount}. Amount must be greater than 0`);
    }

    try {
      // Use the service's transaction preparation method
      const transactionData = this.starknetService.preparePayRentTransaction(
        numericPropertyId, 
        amount
      );

      return {
        success: true,
        transaction: transactionData,
        property_id: numericPropertyId,
        amount: amount,
        prepared_at: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        property_id: numericPropertyId,
        amount: amount,
        prepared_at: new Date().toISOString()
      };
    }
  }

  /**
   * Prepares a rent payment transaction with additional validation
   */
  async prepareRentPayment(propertyId: string | number, amount: number, additionalData?: any) {
    try {
      // First, validate the property exists and get its details
      const numericPropertyId = Number(propertyId);
      const property = await this.starknetService.getProperty(numericPropertyId);
      
      if (!property) {
        throw new Error(`Property with ID ${propertyId} not found`);
      }

      if (property.is_available) {
        throw new Error(`Property ${propertyId} is not currently rented`);
      }

      // Validate the payment amount against the property's rent
      const expectedRent = Number(property.rent_per_month);
      if (amount !== expectedRent) {
        console.warn(`Payment amount (${amount}) differs from expected rent (${expectedRent})`);
      }

      const result = await this.preparePayment(propertyId, amount);
      
      return {
        ...result,
        property_details: {
          owner: property.owner,
          tenant: property.tenant,
          rent_per_month: property.rent_per_month,
          description: property.description
        },
        ...additionalData
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        property_id: propertyId,
        amount: amount,
        prepared_at: new Date().toISOString()
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
   * Validates a property exists and returns its details
   */
  async validateProperty(propertyId: string | number) {
    try {
      const numericPropertyId = Number(propertyId);
      
      if (isNaN(numericPropertyId)) {
        throw new Error(`Invalid propertyId: ${propertyId}`);
      }

      const property = await this.starknetService.getProperty(numericPropertyId);
      
      return {
        valid: true,
        property: property,
        property_id: numericPropertyId
      };
    } catch (error) {
      return {
        valid: false,
        error: (error as Error).message,
        property_id: propertyId
      };
    }
  }

  /**
   * Gets the expected rent amount for a property
   */
  async getExpectedRent(propertyId: string | number) {
    try {
      const validation = await this.validateProperty(propertyId);
      
      if (!validation.valid || !validation.property) {
        throw new Error(validation.error || 'Property not found');
      }

      return {
        property_id: validation.property_id,
        rent_per_month: validation.property.rent_per_month,
        is_available: validation.property.is_available,
        owner: validation.property.owner,
        tenant: validation.property.tenant
      };
    } catch (error) {
      throw new Error(`Failed to get expected rent: ${error.message}`);
    }
  }

  /**
   * Utility method to format transaction data for frontend
   */
  formatTransactionForFrontend(transactionData: any) {
    return {
      contractAddress: transactionData.contractAddress,
      functionName: transactionData.functionName,
      calldata: transactionData.calldata,
      // Add any additional formatting needed for your frontend wallet integration
    };
  }
}