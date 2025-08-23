// src/modules/payment/adapters/chainlink-oracle.adapter.ts
import { Injectable } from '@nestjs/common';
import { ChainlinkService } from '../../common/integrations/chainlink/chainlink.service';

@Injectable()
export class ChainlinkOracleAdapter {
  constructor(private readonly chainlinkService: ChainlinkService) {}

  async getUSDCPrice() {
    return this.chainlinkService.getUSDCPrice();
  }
}