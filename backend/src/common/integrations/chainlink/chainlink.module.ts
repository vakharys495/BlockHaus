// src/integrations/chainlink/chainlink.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import chainlinkConfig from '../../../config/chainlink.config';
import { ChainlinkService } from './chainlink.service';

@Module({
  imports: [ConfigModule.forFeature(chainlinkConfig)],
  providers: [ChainlinkService],
  exports: [ChainlinkService],
})
export class ChainlinkModule {}