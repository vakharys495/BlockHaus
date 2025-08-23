// src/common/utils/pricing.util.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChainlinkService } from '../integrations/chainlink/chainlink.service';

@Injectable()
export class PricingUtil {
  constructor(
    private readonly configService: ConfigService,
    private readonly chainlinkService: ChainlinkService,
  ) {}

  async convertRentToUSD(rentAmount: number): Promise<number> {
    const usdRate = await this.chainlinkService.getUSDCPrice();
    return rentAmount * usdRate;
  }

  async convertUSDToRent(usdAmount: number): Promise<number> {
    const usdRate = await this.chainlinkService.getUSDCPrice();
    return usdAmount / usdRate;
  }
}