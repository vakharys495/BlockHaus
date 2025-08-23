// starknet.service.ts - FIXED FOR PROPER u256 HANDLING
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RpcProvider, Contract, uint256, Account, ec, cairo } from 'starknet';

// ABI for your PropertyRentalMarketplace contract
const PROPERTY_RENTAL_MARKETPLACE_ABI = [
  {
    "type": "function",
    "name": "list_property",
    "inputs": [
      { "name": "rent_per_month", "type": "u256" },
      { "name": "description", "type": "felt252" }
    ],
    "outputs": [{ "type": "u256" }],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "book_property",
    "inputs": [
      { "name": "property_id", "type": "u256" },
      { "name": "duration_months", "type": "u256" }
    ],
    "outputs": [],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "pay_rent",
    "inputs": [
      { "name": "property_id", "type": "u256" },
      { "name": "amount", "type": "u256" }
    ],
    "outputs": [],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "get_property",
    "inputs": [{ "name": "property_id", "type": "u256" }],
    "outputs": [
      { "type": "core::starknet::contract_address::ContractAddress" },
      { "type": "core::starknet::contract_address::ContractAddress" },
      { "type": "u256" },
      { "type": "bool" },
      { "type": "felt252" }
    ],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_property_count",
    "inputs": [],
    "outputs": [{ "type": "u256" }],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_usdt_token",
    "inputs": [],
    "outputs": [{ "type": "core::starknet::contract_address::ContractAddress" }],
    "state_mutability": "view"
  }
];

export interface PropertyData {
  owner: string;
  tenant: string;
  rent_per_month: string;
  is_available: boolean;
  description: string;
}

export interface TransactionResult {
  transaction_hash: string;
  status: 'pending' | 'success' | 'failed';
  block_number?: number;
  property_id?: number;
}

@Injectable()
export class StarknetService {
  private provider: RpcProvider;
  private contract: Contract;
  private account: Account;

  constructor(private readonly configService: ConfigService) {
    const nodeUrl = this.configService.getOrThrow<string>('STARKNET_NODE_URL');
    this.provider = new RpcProvider({ nodeUrl });

    const contractAddress = this.configService.getOrThrow<string>('STARKNET_CONTRACT_ADDRESS');
    this.contract = new Contract(
      PROPERTY_RENTAL_MARKETPLACE_ABI,
      contractAddress,
      this.provider
    );

    // Initialize account for transaction execution
    this.initializeAccount();
  }

  private initializeAccount() {
    try {
      const accountAddress = this.configService.getOrThrow<string>('STARKNET_ACCOUNT_ADDRESS');
      const privateKey = this.configService.getOrThrow<string>('STARKNET_PRIVATE_KEY');
      
      this.account = new Account(this.provider, accountAddress, privateKey);
      
      // Connect contract to account for transaction execution
      this.contract = new Contract(
        PROPERTY_RENTAL_MARKETPLACE_ABI,
        this.configService.getOrThrow<string>('STARKNET_CONTRACT_ADDRESS'),
        this.account
      );
    } catch (error) {
      console.error('Failed to initialize StarkNet account:', error.message);
      throw new Error('StarkNet account configuration is required for transaction execution');
    }
  }

  // READ-ONLY OPERATIONS
  async getProperty(propertyId: number): Promise<PropertyData> {
    try {
      const propertyIdUint256 = this.numberToUint256(propertyId);
      const result = await this.contract.call('get_property', [propertyIdUint256]);

      return {
        owner: result[0],
        tenant: result[1], 
        rent_per_month: uint256.uint256ToBN(result[2]).toString(),
        is_available: result[3],
        description: this.felt252ToString(result[4])
      };
    } catch (error) {
      throw new Error(`Failed to get property: ${error.message}`);
    }
  }

  async getPropertyCount(): Promise<number> {
    try {
      const result = await this.contract.call('get_property_count', []);
      return Number(uint256.uint256ToBN(result[0]));
    } catch (error) {
      throw new Error(`Failed to get property count: ${error.message}`);
    }
  }

  // TRANSACTION EXECUTION METHODS
  async listProperty(rentPerMonth: number, description: string): Promise<TransactionResult> {
    try {
      // Validate inputs
      if (rentPerMonth < 0) {
        throw new Error('Rent per month must be non-negative');
      }
      
      // Convert to proper format for StarkNet.js
      const rentUint256 = this.numberToUint256(rentPerMonth);
      const descriptionFelt = this.stringToFelt252(description);

      console.log('Executing list_property transaction:', {
        rentPerMonth,
        description,
        rentUint256,
        descriptionFelt
      });

      const result = await this.contract.invoke('list_property', [
        rentUint256,
        descriptionFelt
      ]);

      console.log('Transaction submitted:', result.transaction_hash);

      // Wait for transaction confirmation
      const receipt = await this.provider.waitForTransaction(result.transaction_hash);
      
      // Check if transaction was successful
      let status: 'success' | 'failed' = 'failed';
      if ('execution_status' in receipt) {
        status = receipt.execution_status === 'SUCCEEDED' ? 'success' : 'failed';
      } else if ('status' in receipt) {
        status = (receipt as any).status === 'ACCEPTED_ON_L2' || 
                 (receipt as any).status === 'ACCEPTED_ON_L1' ? 'success' : 'failed';
      }

      if (status === 'failed') {
        throw new Error('Transaction execution failed');
      }
      
      // Get the property ID from the transaction events or property count
      const propertyCount = await this.getPropertyCount();
      
      return {
        transaction_hash: result.transaction_hash,
        status: 'success',
        property_id: propertyCount // Latest property ID
      };
    } catch (error) {
      console.error('Failed to list property:', error);
      throw new Error(`Failed to list property: ${error.message}`);
    }
  }

  async bookProperty(propertyId: number, durationMonths: number): Promise<TransactionResult> {
    try {
      const propertyIdUint256 = this.numberToUint256(propertyId);
      const durationUint256 = this.numberToUint256(durationMonths);

      console.log('Executing book_property transaction:', {
        propertyId,
        durationMonths,
        propertyIdUint256,
        durationUint256
      });

      const result = await this.contract.invoke('book_property', [
        propertyIdUint256,
        durationUint256
      ]);

      console.log('Transaction submitted:', result.transaction_hash);

      // Wait for transaction confirmation
      const receipt = await this.provider.waitForTransaction(result.transaction_hash);
      
      // Check if transaction was successful
      let status: 'success' | 'failed' = 'failed';
      if ('execution_status' in receipt) {
        status = receipt.execution_status === 'SUCCEEDED' ? 'success' : 'failed';
      } else if ('status' in receipt) {
        status = (receipt as any).status === 'ACCEPTED_ON_L2' || 
                 (receipt as any).status === 'ACCEPTED_ON_L1' ? 'success' : 'failed';
      }

      if (status === 'failed') {
        throw new Error('Transaction execution failed');
      }

      return {
        transaction_hash: result.transaction_hash,
        status: 'success',
        property_id: propertyId
      };
    } catch (error) {
      console.error('Failed to book property:', error);
      throw new Error(`Failed to book property: ${error.message}`);
    }
  }

  async payRent(propertyId: number, amount: number): Promise<TransactionResult> {
    try {
      const propertyIdUint256 = this.numberToUint256(propertyId);
      const amountUint256 = this.numberToUint256(amount);

      console.log('Executing pay_rent transaction:', {
        propertyId,
        amount,
        propertyIdUint256,
        amountUint256
      });

      const result = await this.contract.invoke('pay_rent', [
        propertyIdUint256,
        amountUint256
      ]);

      console.log('Transaction submitted:', result.transaction_hash);

      // Wait for transaction confirmation
      const receipt = await this.provider.waitForTransaction(result.transaction_hash);
      
      // Check if transaction was successful
      let status: 'success' | 'failed' = 'failed';
      if ('execution_status' in receipt) {
        status = receipt.execution_status === 'SUCCEEDED' ? 'success' : 'failed';
      } else if ('status' in receipt) {
        status = (receipt as any).status === 'ACCEPTED_ON_L2' || 
                 (receipt as any).status === 'ACCEPTED_ON_L1' ? 'success' : 'failed';
      }

      if (status === 'failed') {
        throw new Error('Transaction execution failed');
      }

      return {
        transaction_hash: result.transaction_hash,
        status: 'success',
        property_id: propertyId
      };
    } catch (error) {
      console.error('Failed to pay rent:', error);
      throw new Error(`Failed to pay rent: ${error.message}`);
    }
  }

  // TRANSACTION STATUS CHECKING
  async checkTransactionStatus(transactionHash: string): Promise<TransactionResult> {
    try {
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      
      // Handle different receipt types
      let status: 'success' | 'failed' = 'failed';
      let blockNumber: number | undefined;
      
      if ('execution_status' in receipt) {
        status = receipt.execution_status === 'SUCCEEDED' ? 'success' : 'failed';
      } else if ('status' in receipt) {
        // For older versions or different receipt types
        status = (receipt as any).status === 'ACCEPTED_ON_L2' || 
                 (receipt as any).status === 'ACCEPTED_ON_L1' ? 'success' : 'failed';
      }
      
      if ('block_number' in receipt) {
        blockNumber = receipt.block_number as number;
      } else if ('blockNumber' in receipt) {
        blockNumber = (receipt as any).blockNumber;
      }
      
      return {
        transaction_hash: transactionHash,
        status,
        block_number: blockNumber
      };
    } catch (error) {
      // Transaction might still be pending
      return {
        transaction_hash: transactionHash,
        status: 'pending'
      };
    }
  }

  // CONTRACT INFO FOR FRONTEND (if still needed)
  getContractInfo() {
    return {
      address: this.configService.getOrThrow<string>('STARKNET_CONTRACT_ADDRESS'),
      abi: PROPERTY_RENTAL_MARKETPLACE_ABI,
      network: this.configService.get<string>('STARKNET_NETWORK') || 'sepolia-testnet'
    };
  }

  // UTILITY METHODS - FIXED u256 HANDLING
  numberToUint256(value: number | string): any {
    try {
      // Convert to BigInt first to handle large numbers
      const bigIntValue = typeof value === 'string' ? BigInt(value) : BigInt(value);
      
      // Use cairo.uint256 to properly format for StarkNet
      return cairo.uint256(bigIntValue.toString());
    } catch (error) {
      console.error('Error converting number to uint256:', error);
      // Fallback: try with the original value
      return cairo.uint256('0');
    }
  }

  stringToFelt252(str: string): string {
    try {
      // Ensure the string is not too long for felt252 (31 characters max)
      const truncated = str.substring(0, 31);
      
      // Convert to hex representation
      if (truncated.length === 0) {
        return '0x0';
      }
      
      const hexValue = '0x' + Buffer.from(truncated, 'utf8').toString('hex');
      return hexValue;
    } catch (error) {
      console.error('Error converting string to felt252:', error);
      return '0x0';
    }
  }

  felt252ToString(felt: string | bigint): string {
    try {
      let hex: string;
      
      if (typeof felt === 'bigint') {
        hex = felt.toString(16);
      } else {
        hex = felt.startsWith('0x') ? felt.slice(2) : felt;
      }
      
      if (hex === '0' || hex === '') {
        return '';
      }
      
      // Ensure even length for proper hex decoding
      if (hex.length % 2 !== 0) {
        hex = '0' + hex;
      }
      
      return Buffer.from(hex, 'hex').toString('utf8').replace(/\0/g, '');
    } catch (error) {
      console.error('Error converting felt252 to string:', error);
      return typeof felt === 'string' ? felt : felt.toString();
    }
  }

  // LEGACY METHODS (for backward compatibility) - UPDATED
  prepareListPropertyTransaction(rentPerMonth: number, description: string) {
    return {
      contractAddress: this.getContractInfo().address,
      functionName: 'list_property',
      calldata: [
        this.numberToUint256(rentPerMonth),
        this.stringToFelt252(description)
      ]
    };
  }

  prepareBookPropertyTransaction(propertyId: number, durationMonths: number) {
    return {
      contractAddress: this.getContractInfo().address,
      functionName: 'book_property', 
      calldata: [
        this.numberToUint256(propertyId),
        this.numberToUint256(durationMonths)
      ]
    };
  }

  preparePayRentTransaction(propertyId: number, amount: number) {
    return {
      contractAddress: this.getContractInfo().address,
      functionName: 'pay_rent',
      calldata: [
        this.numberToUint256(propertyId),
        this.numberToUint256(amount)
      ]
    };
  }
}