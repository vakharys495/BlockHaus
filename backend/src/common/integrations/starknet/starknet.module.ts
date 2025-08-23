// src/integrations/starknet/starknet.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import starknetConfig from '../../../config/starknet.config';
import { StarknetService } from './starknet.service';
import { StarknetPaymentAdapter } from 'src/payment/adapters/starknet-payment.adapter';

@Module({
  imports: [ConfigModule.forFeature(starknetConfig)],
  providers: [StarknetService,StarknetPaymentAdapter],
  exports: [StarknetService,StarknetPaymentAdapter],
})
export class StarknetModule {}