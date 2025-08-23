import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // Add this import
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PropertyModule } from './property/property.module';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';
import { ChatModule } from './chat/chat.module';
import { ReviewsModule } from './reviews/reviews.module';
import { GovernanceModule } from './governance/governance.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ConfigModule } from '@nestjs/config';
import envValidation from './config/env.validation';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from './common/database/database.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidation,
    }),
    // Add JwtModule here with global: true
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h') },
      }),
      inject: [ConfigService],
      global: true, // This makes JwtModule available globally
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error('MONGODB_URI is not defined in the configuration');
        }
        return { uri };
      },
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuthModule,
    PropertyModule,
    BookingModule,
    PaymentModule,
    ChatModule,
    ReviewsModule,
    GovernanceModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}