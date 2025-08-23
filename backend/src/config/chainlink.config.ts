// src/config/chainlink.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('chainlink', () => ({
  usdcPriceFeed: process.env.CHAINLINK_USDC_PRICE_FEED,
  rentTokenAddress: process.env.RENT_TOKEN_ADDRESS,
  oracleAddress: process.env.CHAINLINK_ORACLE_ADDRESS,
}));