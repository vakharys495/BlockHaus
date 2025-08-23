import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RpcProvider, Contract, uint256 } from 'starknet';

@Injectable()
export class StarknetUtil {
  private provider: RpcProvider;
  private propertyContract: Contract;
  private bookingContract: Contract;
  private paymentContract: Contract;

  constructor(private readonly configService: ConfigService) {
    // Initialize provider with node URL
    const nodeUrl = this.configService.getOrThrow<string>('STARKNET_NODE_URL');
    this.provider = new RpcProvider({
      nodeUrl
    });

    // Initialize contracts
    this.propertyContract = new Contract(
      JSON.parse(this.configService.getOrThrow<string>('STARKNET_PROPERTY_CONTRACT_ABI')),
      this.configService.getOrThrow<string>('STARKNET_PROPERTY_CONTRACT_ADDRESS'),
      this.provider
    );

    this.bookingContract = new Contract(
      JSON.parse(this.configService.getOrThrow<string>('STARKNET_BOOKING_CONTRACT_ABI')),
      this.configService.getOrThrow<string>('STARKNET_BOOKING_CONTRACT_ADDRESS'),
      this.provider
    );

    this.paymentContract = new Contract(
      JSON.parse(this.configService.getOrThrow<string>('STARKNET_PAYMENT_CONTRACT_ABI')),
      this.configService.getOrThrow<string>('STARKNET_PAYMENT_CONTRACT_ADDRESS'),
      this.provider
    );
  }

  async listProperty(owner: string, details: any, price: number): Promise<any> {
    try {
      const tx = await this.propertyContract.invoke('listProperty', [
        owner,
        JSON.stringify(details),
        uint256.bnToUint256(price),
      ]);
      return tx;
    } catch (error) {
      throw new Error(`Failed to list property: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getProperty(id: number): Promise<any> {
    try {
      return await this.propertyContract.call('getProperty', [id]);
    } catch (error) {
      throw new Error(`Failed to get property: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}