import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RpcProvider, Contract, Account, CallData, uint256, Call, validateAndParseAddress } from 'starknet';

// Custom toFelt implementation
function toFelt(value: number | string): string {
  try {
    const bigIntValue = BigInt(value);
    if (bigIntValue < 0) {
      throw new Error('Value cannot be negative');
    }
    return '0x' + bigIntValue.toString(16);
  } catch (error) {
    throw new Error(`Failed to convert ${value} to felt252: ${error.message}`);
  }
}

// Updated ABI to match the Cairo contract
const PROPERTY_RENTAL_MARKETPLACE_ABI = [
  {
    type: 'function',
    name: 'list_property',
    inputs: [
      { name: 'rent_per_month', type: 'core::integer::u256' },
      { name: 'description', type: 'felt252' },
    ],
    outputs: [{ type: 'u256' }],
    state_mutability: 'external',
  },
  {
    type: 'function',
    name: 'book_property',
    inputs: [
      { name: 'property_id', type: 'core::integer::u256' },
      { name: 'duration_months', type: 'core::integer::u256' },
    ],
    outputs: [],
    state_mutability: 'external',
  },
  {
    type: 'function',
    name: 'pay_rent',
    inputs: [
      { name: 'property_id', type: 'core::integer::u256' },
      { name: 'amount', type: 'core::integer::u256' },
    ],
    outputs: [],
    state_mutability: 'external',
  },
  {
    type: 'function',
    name: 'get_property',
    inputs: [{ name: 'property_id', type: 'core::integer::u256' }],
    outputs: [
      { name: 'owner', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'tenant', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'rent_per_month', type: 'core::integer::u256' },
      { name: 'is_available', type: 'bool' },
      { name: 'description', type: 'felt252' },
    ],
    state_mutability: 'view',
  },
  {
    type: 'function',
    name: 'get_property_count',
    inputs: [],
    outputs: [{ name: 'count', type: 'core::integer::u256' }],
    state_mutability: 'view',
  },
  {
    type: 'function',
    name: 'get_usdt_token',
    inputs: [],
    outputs: [{ type: 'core::starknet::contract_address::ContractAddress' }],
    state_mutability: 'view',
  },
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
  private nodeUrl: string;

  constructor(private readonly configService: ConfigService) {
    let nodeUrl = this.configService.get<string>('rpc-url');
    if (!nodeUrl) {
      throw new Error('STARKNET_NODE_URL is not defined in environment configuration');
    }
    if (!nodeUrl.startsWith('http://') && !nodeUrl.startsWith('https://')) {
      throw new Error('Invalid STARKNET_NODE_URL: Must be a valid HTTP/HTTPS URL');
    }
    this.provider = new RpcProvider({ nodeUrl });
    this.initializeAccount();
  }

  private async initializeAccount() {
    try {
      const accountAddress = this.configService.getOrThrow<string>('STARKNET_ACCOUNT_ADDRESS');
      const privateKey = this.configService.getOrThrow<string>('STARKNET_PRIVATE_KEY');
      const contractAddress = this.configService.getOrThrow<string>('STARKNET_CONTRACT_ADDRESS');

      // Validate account address format
      try {
        validateAndParseAddress(accountAddress);
      } catch (error) {
        throw new Error(`Invalid STARKNET_ACCOUNT_ADDRESS format: ${error.message}`);
      }

      // Validate contract address format
      try {
        validateAndParseAddress(contractAddress);
      } catch (error) {
        throw new Error(`Invalid STARKNET_CONTRACT_ADDRESS format: ${error.message}`);
      }

      // Test node connectivity
      try {
        const chainId = await this.provider.getChainId();
        console.log(`Successfully connected to StarkNet node. Chain ID: ${chainId}`);
      } catch (error) {
        throw new Error(`Failed to connect to StarkNet node at ${this.nodeUrl}: ${error.message}`);
      }

      this.account = new Account(this.provider, accountAddress, privateKey);

      // Validate account by checking nonce
      try {
        const nonce = await this.provider.getNonceForAddress(accountAddress, 'pending');
        console.log(`Account ${accountAddress} nonce:`, nonce);
      } catch (error) {
        throw new Error(`Invalid STARKNET_ACCOUNT_ADDRESS: Account not found on network: ${error.message}`);
      }

      // Initialize contract with account
      this.contract = new Contract(PROPERTY_RENTAL_MARKETPLACE_ABI, contractAddress, this.account);
    } catch (error) {
      console.error('Failed to initialize StarkNet account:', {
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`StarkNet account configuration is required: ${error.message}`);
    }
  }

  // Utility to test node connectivity
  async testNodeConnectivity(): Promise<string> {
    try {
      const chainId = await this.provider.getChainId();
      return `Node is reachable. Chain ID: ${chainId}`;
    } catch (error) {
      throw new Error(`Failed to connect to StarkNet node at ${this.nodeUrl}: ${error.message}`);
    }
  }

  // Utility to simulate get_property call
  async simulateGetProperty(propertyId: number): Promise<any> {
    const propertyIdU256 = this.numberToUint256(propertyId);
    try {
      const result = await this.provider.callContract({
        contractAddress: this.contract.address,
        entrypoint: 'get_property',
        calldata: CallData.compile([propertyIdU256]),
      });
      console.log('Simulated get_property result:', result);
      return result;
    } catch (error) {
      console.error('Simulation failed:', error);
      throw error;
    }
  }

  // READ-ONLY OPERATIONS
  async getProperty(propertyId: number): Promise<PropertyData> {
    try {
      const propertyIdU256 = this.numberToUint256(propertyId);
      console.log('Calling get_property with:', { propertyId, propertyIdU256 });
      const result: any = await this.contract.call('get_property', [propertyIdU256]);
      console.log('get_property raw result:', result);
      return {
        owner: result.owner,
        tenant: result.tenant,
        rent_per_month: uint256.uint256ToBN(result.rent_per_month).toString(),
        is_available: result.is_available,
        description: this.felt252ToString(result.description),
      };
    } catch (error) {
      console.error('Failed to get property:', {
        propertyId,
        errorMessage: error.message,
        stack: error.stack,
        contractAddress: this.contract.address,
      });
      throw new Error(`Failed to get property: ${error.message}`);
    }
  }

  async getPropertyCount(): Promise<number> {
    try {
      const result: any = await this.contract.call('get_property_count', []);
      console.log('get_property_count raw result:', result);
      return Number(uint256.uint256ToBN(result.count));
    } catch (error) {
      console.error('Failed to get property count:', error.message);
      throw new Error(`Failed to get property count: ${error.message}`);
    }
  }

  // TRANSACTION EXECUTION METHODS
  async listProperty(
    rentPerMonth: number,
    description: string,
  ): Promise<TransactionResult> {
    try {
      // Validate input
      if (!Number.isFinite(rentPerMonth) || rentPerMonth < 0) {
        throw new Error('Rent per month must be a non-negative number');
      }
      if (typeof description !== 'string' || description.trim() === '') {
        throw new Error('Description must be a non-empty string');
      }
      if (description.length > 31) {
        throw new Error('Description must be 31 characters or less for felt252');
      }

      // Convert rent to u256
      const rentU256 = this.numberToUint256(rentPerMonth);
      const descriptionFelt = this.stringToFelt252(description);

      console.log('listProperty inputs:', {
        rentPerMonth,
        rentU256,
        description,
        descriptionFelt,
      });

      // Try contract.invoke
      let result;
      try {
        const calldata = [rentU256, descriptionFelt];
        console.log('Raw calldata:', calldata);
        result = await this.contract.invoke('list_property', calldata);
        console.log('Success with invoke');
      } catch (error) {
        console.warn('Invoke failed:', error.message);
        // Fallback to raw invoke
        console.log('Attempting raw invoke');
        const rawCalldata = CallData.compile([rentU256, descriptionFelt]);
        console.log('Raw invoke calldata:', rawCalldata);
        result = await this.account.execute({
          contractAddress: this.contract.address,
          entrypoint: 'list_property',
          calldata: rawCalldata,
        });
      }

      console.log('Transaction submitted:', result.transaction_hash);

      const receipt = await this.provider.waitForTransaction(
        result.transaction_hash,
      );

      let status: 'success' | 'failed' = 'failed';
      if ('execution_status' in receipt) {
        status =
          receipt.execution_status === 'SUCCEEDED' ? 'success' : 'failed';
      } else if ('status' in receipt) {
        status =
          receipt.status === 'ACCEPTED_ON_L2' ||
          receipt.status === 'ACCEPTED_ON_L1'
            ? 'success'
            : 'failed';
      }

      if (status === 'failed') {
        console.error('Transaction receipt:', JSON.stringify(receipt, null, 2));
        throw new Error(`Transaction execution failed: ${JSON.stringify(receipt)}`);
      }

      const propertyCount = await this.getPropertyCount();

      return {
        transaction_hash: result.transaction_hash,
        status: 'success',
        property_id: propertyCount,
      };
    } catch (error) {
      console.error('Failed to list property:', error.message, error.stack);
      throw new Error(`Failed to list property: ${error.message}`);
    }
  }

  async bookProperty(
    propertyId: number,
    durationMonths: number,
  ): Promise<TransactionResult> {
    try {
      // Validate inputs
      if (!Number.isInteger(propertyId) || propertyId <= 0) {
        throw new Error('Property ID must be a positive integer');
      }
      if (!Number.isInteger(durationMonths) || durationMonths <= 0) {
        throw new Error('Duration months must be a positive integer');
      }

      // Check if property ID is within valid range
      const propertyCount = await this.getPropertyCount();
      if (propertyId > propertyCount) {
        throw new Error(`Property ID ${propertyId} exceeds total properties (${propertyCount})`);
      }

      // Check if property exists and is available
      const property = await this.getProperty(propertyId);
      if (!property.is_available) {
        throw new Error(`Property ${propertyId} is not available for booking`);
      }

      const propertyIdU256 = this.numberToUint256(propertyId);
      const durationU256 = this.numberToUint256(durationMonths);

      let result;
      try {
        const calldata = [propertyIdU256, durationU256];
        console.log('Calling book_property with:', { propertyId, durationMonths, propertyIdU256, durationU256 });
        result = await this.contract.invoke('book_property', calldata);
        console.log('Success with invoke');
      } catch (error) {
        console.warn('Invoke failed for book_property:', error.message);
        console.log('Attempting raw invoke');
        const rawCalldata = CallData.compile([propertyIdU256, durationU256]);
        console.log('Raw invoke calldata:', rawCalldata);

        // Conditional resourceBounds to avoid TypeScript error
        const executeParams: any = {
          contractAddress: this.contract.address,
          entrypoint: 'book_property',
          calldata: rawCalldata,
        };
        if (typeof this.account.execute === 'function') {
          executeParams.resourceBounds = {
            l1_gas: { max_amount: '0x10000', max_price_per_unit: '0x1000000000' },
            l2_gas: { max_amount: '0x0', max_price_per_unit: '0x0' },
            l1_data_gas: { max_amount: '0x10000', max_price_per_unit: '0x1000000000' },
          };
        } else {
          console.warn('resourceBounds not supported in this starknet version; omitting.');
        }

        result = await this.account.execute(executeParams);
      }

      console.log('Transaction submitted:', result.transaction_hash);

      const receipt = await this.provider.waitForTransaction(
        result.transaction_hash,
      );

      let status: 'success' | 'failed' = 'failed';
      if ('execution_status' in receipt) {
        status = receipt.execution_status === 'SUCCEEDED' ? 'success' : 'failed';
      } else if ('status' in receipt) {
        status =
          receipt.status === 'ACCEPTED_ON_L2' ||
          receipt.status === 'ACCEPTED_ON_L1'
            ? 'success'
            : 'failed';
      }

      if (status === 'failed') {
        console.error('Transaction receipt:', JSON.stringify(receipt, null, 2));
        throw new Error(`Transaction execution failed: ${JSON.stringify(receipt)}`);
      }

      return {
        transaction_hash: result.transaction_hash,
        status: 'success',
        property_id: propertyId,
      };
    } catch (error) {
      console.error('Failed to book property:', {
        message: error.message,
        stack: error.stack,
        propertyId,
        durationMonths,
        contractAddress: this.contract.address,
      });
      throw new Error(`Failed to book property: ${error.message}`);
    }
  }

  async payRent(
    propertyId: number,
    amount: number,
  ): Promise<TransactionResult> {
    try {
      // Validate inputs
      if (!Number.isInteger(propertyId) || propertyId <= 0) {
        throw new Error('Property ID must be a positive integer');
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Amount must be a positive number');
      }

      // Check if property ID is within valid range
      const propertyCount = await this.getPropertyCount();
      if (propertyId > propertyCount) {
        throw new Error(`Property ID ${propertyId} exceeds total properties (${propertyCount})`);
      }

      const propertyIdU256 = this.numberToUint256(propertyId);
      const amountU256 = this.numberToUint256(amount);

      let result;
      try {
        const calldata = [propertyIdU256, amountU256];
        console.log('Calling pay_rent with:', { propertyId, amount, propertyIdU256, amountU256 });
        result = await this.contract.invoke('pay_rent', calldata);
        console.log('Success with invoke');
      } catch (error) {
        console.warn('Invoke failed for pay_rent:', error.message);
        console.log('Attempting raw invoke');
        const rawCalldata = CallData.compile([propertyIdU256, amountU256]);
        console.log('Raw invoke calldata:', rawCalldata);

        // Conditional resourceBounds to avoid TypeScript error
        const executeParams: any = {
          contractAddress: this.contract.address,
          entrypoint: 'pay_rent',
          calldata: rawCalldata,
        };
        if (typeof this.account.execute === 'function') {
          executeParams.resourceBounds = {
            l1_gas: { max_amount: '0x10000', max_price_per_unit: '0x1000000000' },
            l2_gas: { max_amount: '0x0', max_price_per_unit: '0x0' },
            l1_data_gas: { max_amount: '0x10000', max_price_per_unit: '0x1000000000' },
          };
        } else {
          console.warn('resourceBounds not supported in this starknet version; omitting.');
        }

        result = await this.account.execute(executeParams);
      }

      console.log('Transaction submitted:', result.transaction_hash);

      const receipt = await this.provider.waitForTransaction(
        result.transaction_hash,
      );

      let status: 'success' | 'failed' = 'failed';
      if ('execution_status' in receipt) {
        status = receipt.execution_status === 'SUCCEEDED' ? 'success' : 'failed';
      } else if ('status' in receipt) {
        status =
          receipt.status === 'ACCEPTED_ON_L2' ||
          receipt.status === 'ACCEPTED_ON_L1'
            ? 'success'
            : 'failed';
      }

      if (status === 'failed') {
        console.error('Transaction receipt:', JSON.stringify(receipt, null, 2));
        throw new Error(`Transaction execution failed: ${JSON.stringify(receipt)}`);
      }

      return {
        transaction_hash: result.transaction_hash,
        status: 'success',
        property_id: propertyId,
      };
    } catch (error) {
      console.error('Failed to pay rent:', {
        message: error.message,
        stack: error.stack,
        propertyId,
        amount,
        contractAddress: this.contract.address,
      });
      throw new Error(`Failed to pay rent: ${error.message}`);
    }
  }

  // TRANSACTION STATUS CHECKING
  async checkTransactionStatus(
    transactionHash: string,
  ): Promise<TransactionResult> {
    try {
      const receipt = await this.provider.getTransactionReceipt(transactionHash);

      let status: 'success' | 'failed' = 'failed';
      let blockNumber: number | undefined;

      if ('execution_status' in receipt) {
        status = receipt.execution_status === 'SUCCEEDED' ? 'success' : 'failed';
      } else if ('status' in receipt) {
        status =
          receipt.status === 'ACCEPTED_ON_L2' ||
          receipt.status === 'ACCEPTED_ON_L1'
            ? 'success'
            : 'failed';
      }

      if ('block_number' in receipt) {
        blockNumber = receipt.block_number as number;
      } else if ('blockNumber' in receipt) {
        blockNumber = Number(receipt.blockNumber);
      }

      return {
        transaction_hash: transactionHash,
        status,
        block_number: blockNumber,
      };
    } catch {
      return {
        transaction_hash: transactionHash,
        status: 'pending',
      };
    }
  }

  // CONTRACT INFO
  getContractInfo() {
    return {
      address: this.configService.getOrThrow<string>(
        'STARKNET_CONTRACT_ADDRESS',
      ),
      abi: PROPERTY_RENTAL_MARKETPLACE_ABI,
      network: this.configService.get<string>('STARKNET_NETWORK') || 'sepolia-testnet',
    };
  }

  // UTILITIES
  numberToUint256(value: number | string): { low: string; high: string } {
    try {
      if (value === null || value === undefined) {
        throw new Error('Input value cannot be null or undefined');
      }

      const bigIntValue = BigInt(value);
      if (bigIntValue < 0) {
        throw new Error('Input value cannot be negative');
      }

      const u256Value = uint256.bnToUint256(bigIntValue);
      if (!u256Value || typeof u256Value !== 'object' || !('low' in u256Value) || !('high' in u256Value)) {
        throw new Error('Failed to convert to valid u256 format');
      }

      return {
        low: u256Value.low.toString(),
        high: u256Value.high.toString(),
      };
    } catch (error) {
      console.error(`Error converting ${value} to uint256:`, error.message);
      throw new Error(`Invalid input for uint256 conversion: ${error.message}`);
    }
  }

  stringToFelt252(str: string): string {
    try {
      const truncated = str.substring(0, 31);
      if (truncated.length === 0) {
        return '0x0';
      }
      const hex = Buffer.from(truncated, 'utf8').toString('hex');
      // Ensure the hex string is a valid felt252 (less than 2^252)
      const bigIntValue = BigInt(`0x${hex}`);
      if (bigIntValue >= BigInt('0x800000000000011000000000000000000000000000000000000000000000000')) {
        throw new Error('Description too large for felt252');
      }
      return '0x' + hex;
    } catch (error) {
      console.error(`Error converting string to felt252: ${error.message}`);
      return '0x0';
    }
  }

  felt252ToString(felt: string | bigint): string {
    try {
      let hex: string =
        typeof felt === 'bigint'
          ? felt.toString(16)
          : felt.startsWith('0x')
          ? felt.slice(2)
          : felt;

      if (hex === '0' || hex === '') return '';
      if (hex.length % 2 !== 0) hex = '0' + hex;

      return Buffer.from(hex, 'hex').toString('utf8').replace(/\0/g, '');
    } catch {
      return typeof felt === 'string' ? felt : felt.toString();
    }
  }
}