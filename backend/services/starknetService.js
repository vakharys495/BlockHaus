const { contract, account, provider, USDT_CONTRACT_ADDRESS } = require('../config/starknet');
const { uint256 } = require('starknet');

class StarkNetService {
  // Get property count from contract
  async getPropertyCount() {
    try {
      const count = await contract.get_property_count();
      // Convert u256 to regular number
      return Number(count.low);
    } catch (error) {
      console.error('Error getting property count:', error);
      throw new Error('Failed to get property count');
    }
  }

  // Get property by ID
  async getPropertyById(propertyId) {
    try {
      const property = await contract.get_property(uint256.bnToUint256(propertyId));
      
      // Parse the returned tuple
      const [owner, tenant, rentPerMonth, isBooked, description] = property;
      
      return {
        id: propertyId,
        owner: owner,
        tenant: tenant,
        rentPerMonth: Number(rentPerMonth.low),
        isBooked: isBooked === 1 ? true : false,
        description: description
      };
    } catch (error) {
      console.error(`Error getting property ${propertyId}:`, error);
      throw new Error(`Failed to get property ${propertyId}`);
    }
  }

  // Get all properties
  async getAllProperties() {
    try {
      const count = await this.getPropertyCount();
      const properties = [];
      
      // Fetch all properties
      for (let i = 1; i <= count; i++) {
        try {
          const property = await this.getPropertyById(i);
          properties.push(property);
        } catch (error) {
          console.error(`Error fetching property ${i}:`, error);
          // Continue with other properties
        }
      }
      
      return properties;
    } catch (error) {
      console.error('Error getting all properties:', error);
      throw new Error('Failed to get properties');
    }
  }

  // List a new property
  async listProperty(rentPerMonth, description) {
    if (!account) {
      throw new Error('Account not configured for writing to contract');
    }

    try {
      // Convert rentPerMonth to u256
      const rentPerMonthU256 = uint256.bnToUint256(rentPerMonth);
      
      // Call the contract function
      const { transaction_hash } = await account.execute(
        {
          contractAddress: contract.address,
          entrypoint: 'list_property',
          calldata: [rentPerMonthU256, description]
        }
      );
      
      // Wait for transaction to be accepted
      const result = await provider.waitForTransaction(transaction_hash);
      
      return {
        transactionHash: transaction_hash,
        status: result.status
      };
    } catch (error) {
      console.error('Error listing property:', error);
      throw new Error('Failed to list property');
    }
  }

  // Book a property
  async bookProperty(propertyId, durationMonths) {
    if (!account) {
      throw new Error('Account not configured for writing to contract');
    }

    try {
      // Convert parameters to u256
      const propertyIdU256 = uint256.bnToUint256(propertyId);
      const durationMonthsU256 = uint256.bnToUint256(durationMonths);
      
      // Call the contract function
      const { transaction_hash } = await account.execute(
        {
          contractAddress: contract.address,
          entrypoint: 'book_property',
          calldata: [propertyIdU256, durationMonthsU256]
        }
      );
      
      // Wait for transaction to be accepted
      const result = await provider.waitForTransaction(transaction_hash);
      
      return {
        transactionHash: transaction_hash,
        status: result.status
      };
    } catch (error) {
      console.error('Error booking property:', error);
      throw new Error('Failed to book property');
    }
  }

  // Pay rent for a property
  async payRent(propertyId, amount) {
    if (!account) {
      throw new Error('Account not configured for writing to contract');
    }

    try {
      // Convert parameters to u256
      const propertyIdU256 = uint256.bnToUint256(propertyId);
      const amountU256 = uint256.bnToUint256(amount);
      
      // Call the contract function
      const { transaction_hash } = await account.execute(
        {
          contractAddress: contract.address,
          entrypoint: 'pay_rent',
          calldata: [propertyIdU256, amountU256]
        }
      );
      
      // Wait for transaction to be accepted
      const result = await provider.waitForTransaction(transaction_hash);
      
      return {
        transactionHash: transaction_hash,
        status: result.status
      };
    } catch (error) {
      console.error('Error paying rent:', error);
      throw new Error('Failed to pay rent');
    }
  }

  // Get USDT token address
  async getUsdtTokenAddress() {
    try {
      const address = await contract.get_usdt_token();
      return address;
    } catch (error) {
      console.error('Error getting USDT token address:', error);
      throw new Error('Failed to get USDT token address');
    }
  }
}

module.exports = new StarkNetService();