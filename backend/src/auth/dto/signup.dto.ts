// src/modules/auth/dto/wallet-signup.dto.ts
import { IsString, IsOptional, IsEthereumAddress } from 'class-validator';

export class WalletSignupDto {
  @IsEthereumAddress()
  walletAddress: string;

  @IsString()
  signature: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  name?: string;
}
