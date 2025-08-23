// src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { WalletAuthDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Authenticate with wallet (login/signup)' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('authenticate')
  @HttpCode(HttpStatus.OK)
  async authenticate(@Body() authDto: WalletAuthDto) {
    return this.authService.authenticate(authDto);
  }

  @ApiOperation({ summary: 'Login with wallet' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid signature or user not found' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: WalletAuthDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Signup with wallet' })
  @ApiResponse({ status: 200, description: 'Signup successful' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signup(@Body() signupDto: WalletAuthDto) {
    return this.authService.signup(signupDto);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.authService.getUserByWalletAddress(req.user.walletAddress);
    if (!user) {
      return { message: 'User not found' };
    }
    
    return {
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        name: user.name,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      }
    };
  }

  @ApiOperation({ summary: 'Logout user (client-side token removal)' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    // Since we're using stateless JWT tokens, logout is handled client-side
    // by removing the tokens from storage
    return { 
      message: 'Logged out successfully. Please remove tokens from client storage.' 
    };
  }

  @ApiOperation({ summary: 'Health check for auth service' })
  @ApiResponse({ status: 200, description: 'Auth service is healthy' })
  @Get('health')
  async health() {
    return { 
      status: 'ok', 
      service: 'auth',
      timestamp: new Date().toISOString()
    };
  }
}