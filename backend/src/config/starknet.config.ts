// src/config/starknet.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('starknet', () => ({
  providerUrl: process.env.STARKNET_PROVIDER_URL,
  network: process.env.STARKNET_NETWORK || 'mainnet',
  propertyContractAddress: process.env.PROPERTY_CONTRACT_ADDRESS,
  bookingContractAddress: process.env.BOOKING_CONTRACT_ADDRESS,
  paymentContractAddress: process.env.PAYMENT_CONTRACT_ADDRESS,
  rentTokenContractAddress: process.env.RENT_TOKEN_CONTRACT_ADDRESS,
}));