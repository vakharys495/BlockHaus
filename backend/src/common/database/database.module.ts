// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error('MONGODB_URI is not defined in the configuration');
        }
        return {
          uri,
          // Remove deprecated options:
          // useNewUrlParser: true,    // No longer needed in v4+
          // useUnifiedTopology: true, // No longer needed in v4+
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}