import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

@Injectable()
export class ChainlinkService {
  private provider: ethers.JsonRpcProvider;
  private oracleContract: ethers.Contract;

  constructor(private readonly configService: ConfigService) {
    const ethereumUrl = this.configService.getOrThrow<string>('ETHEREUM_PROVIDER_URL');
    const oracleAddress = this.configService.getOrThrow<string>('CHAINLINK_ORACLE_ADDRESS');
    
    this.provider = new ethers.JsonRpcProvider(ethereumUrl);

    this.oracleContract = new ethers.Contract(
      oracleAddress,
      [
        'function getLatestPrice(address base, address quote) external view returns (int256)',
      ],
      this.provider
    );
  }

  async getUSDCPrice(): Promise<number> {
    const usdcAddress = this.configService.getOrThrow<string>('CHAINLINK_USDC_PRICE_FEED');
    const rentAddress = this.configService.getOrThrow<string>('CHAINLINK_RENT_TOKEN_ADDRESS');
    
    const price = await this.oracleContract.getLatestPrice(
      rentAddress,
      usdcAddress
    );
    return parseFloat(ethers.formatUnits(price, 8));
  }
}