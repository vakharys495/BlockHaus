// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/auth.entity';
import { WalletAuthDto } from './dto/login.dto';
import { ethers } from 'ethers';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }


  async authenticate(authDto: WalletAuthDto) {
    const { walletAddress, signature, message, name } = authDto;
    const normalizedAddress = walletAddress.trim();

    // Verify signature
    const isValidSignature = await this.verifySignature(
      normalizedAddress,
      signature,
      message,
    );

    if (!isValidSignature) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Find existing user
    let user = await this.userModel.findOne({
      walletAddress: normalizedAddress
    });

    if (user) {
      // Existing user - perform login
      user.lastLogin = new Date();
      await user.save();

      const tokens = await this.generateTokens(user);
      return {
        action: 'login',
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          name: user.name,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
        ...tokens
      };
    } else {
      // New user - perform signup
      user = new this.userModel({
        walletAddress: normalizedAddress,
        name: name || `User_${normalizedAddress.slice(0, 8)}`,
        createdAt: new Date(),
      });
      await user.save();

      const tokens = await this.generateTokens(user);
      return {
        action: 'signup',
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          name: user.name,
          createdAt: user.createdAt,
        },
        ...tokens
      };
    }
  }

  // Legacy methods for backward compatibility
  async signup(signupDto: WalletAuthDto) {
    const { walletAddress } = signupDto;
    const normalizedAddress = walletAddress.trim();

    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      walletAddress: normalizedAddress
    });

    if (existingUser) {
      return this.login({ walletAddress: normalizedAddress,signature:signupDto.signature,message:signupDto.message})
    }

    return this.authenticate(signupDto);
  }

  async login(loginDto: WalletAuthDto) {
    const { walletAddress } = loginDto;
    const normalizedAddress = walletAddress.trim();

    const user = await this.userModel.findOne({
      walletAddress: normalizedAddress
    });

    if (!user) {
      throw new UnauthorizedException('User not found. Please signup first.');
    }

    return this.authenticate(loginDto);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async verifySignature(
    walletAddress: string,
    signature: string,
    message: string,
  ): Promise<boolean> {
    try {
      // Just basic checks — no Ethereum address recovery
      if (!signature || !message || signature.length === 0 || message.length === 0) {
        return false;
      }

      // Optional: you can still check length to avoid garbage input
      return signature.length > 10 && message.length > 10;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }



  private async generateTokens(user: any) {
    const payload = { sub: user._id, walletAddress: user.walletAddress };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return { accessToken, refreshToken };
  }


  // Helper method to get user by wallet address
  async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    return this.userModel.findOne({
      walletAddress: walletAddress.trim(),
    });
  }
}