// src/modules/booking/booking.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingSchema } from './entities/booking.entity';
import { PropertyModule } from '../property/property.module';
import { StarknetModule } from '../common/integrations/starknet/starknet.module';
import { PaymentModule } from '../payment/payment.module';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Booking', schema: BookingSchema }]),
    PropertyModule,
    StarknetModule,
    forwardRef(() => PaymentModule),
    AuthModule, // Add AuthModule import
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}