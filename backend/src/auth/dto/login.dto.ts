// src/modules/auth/dto/wallet-auth.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WalletAuthDto {
  @ApiProperty({ 
    description: 'Wallet address (any format)', 
    example: '0x1234567890123456789012345678901234567890' 
  })
  @IsString()
  walletAddress: string;

  @ApiProperty({ 
    description: 'Signature from wallet', 
    example: '0xabcdef...' 
  })
  @IsString()
  signature: string;

  @ApiProperty({ 
    description: 'Message that was signed', 
    example: 'Please sign this message to authenticate with MyApp' 
  })
  @IsString()
  message: string;

  @ApiProperty({ 
    description: 'Optional user name', 
    example: 'John Doe',
    required: false 
  })
  @IsOptional()
  @IsString()
  name?: string;
}

// Legacy DTOs for backward compatibility
export class WalletLoginDto extends WalletAuthDto {}
export class WalletSignupDto extends WalletAuthDto {}

// // Legacy DTOs for backward compatibility
// export class WalletLoginDto extends WalletAuthDto {}
// export class WalletSignupDto extends WalletAuthDto {}