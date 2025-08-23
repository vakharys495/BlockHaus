// src/modules/auth/dto/get-nonce.dto.ts
import { IsEthereumAddress } from 'class-validator';

export class GetNonceDto {
  @IsEthereumAddress()
  walletAddress: string;
}
