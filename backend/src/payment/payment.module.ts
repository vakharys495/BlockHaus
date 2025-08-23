// src/modules/payment/payment.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { TransactionSchema } from './entities/payment.entity';
import { StarknetModule } from '../common/integrations/starknet/starknet.module';
import { ChainlinkModule } from '../common/integrations/chainlink/chainlink.module';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Transaction', schema: TransactionSchema },
    ]),
    forwardRef(() => BookingModule),
    StarknetModule,
    ChainlinkModule,
    // Add JwtModule import
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}