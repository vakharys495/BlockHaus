// src/config/env.validation.ts
import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  STARKNET_PROVIDER_URL: Joi.string().required(),
  PROPERTY_CONTRACT_ADDRESS: Joi.string().required(),
  BOOKING_CONTRACT_ADDRESS: Joi.string().required(),
  PAYMENT_CONTRACT_ADDRESS: Joi.string().required(),
  RENT_TOKEN_CONTRACT_ADDRESS: Joi.string().required(),
  CHAINLINK_USDC_PRICE_FEED: Joi.string().required(),
  GOOGLE_CLIENT_ID: Joi.string(),
  GOOGLE_CLIENT_SECRET: Joi.string(),
  APPLE_CLIENT_ID: Joi.string(),
  APPLE_TEAM_ID: Joi.string(),
  APPLE_KEY_ID: Joi.string(),
  APPLE_PRIVATE_KEY: Joi.string(),
  XMTP_ENV: Joi.string().valid('dev', 'production').default('production'),
  MOONPAY_API_KEY: Joi.string(),
  READY_WALLET_API_KEY: Joi.string(),
  AWS_SNS_REGION: Joi.string(),
  AWS_ACCESS_KEY_ID: Joi.string(),
  AWS_SECRET_ACCESS_KEY: Joi.string(),
});