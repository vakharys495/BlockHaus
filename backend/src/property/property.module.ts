// src/modules/property/property.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { PropertySchema } from './entities/property.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StarknetModule } from '../common/integrations/starknet/starknet.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Property', schema: PropertySchema },
    ]),
    StarknetModule,
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
  controllers: [PropertyController],
  providers: [PropertyService, JwtAuthGuard], // JwtAuthGuard is used here
  exports: [PropertyService],
})
export class PropertyModule {}