// src/modules/auth/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { applyMongoosePlugins } from '../../common/database/mongoose.plugin';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  walletAddress: string;
  

  @Prop()
  name?: string;


  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  lastLogin: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
applyMongoosePlugins(UserSchema);