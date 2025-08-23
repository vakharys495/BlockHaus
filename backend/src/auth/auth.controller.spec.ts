// // src/modules/auth/auth.controller.ts
// import { Controller, Post, Body, Get, Query } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { WalletLoginDto } from './dto/login.dto';
// import { WalletSignupDto } from './dto/signup.dto';
// import { GetNonceDto } from './dto/get-nonce.dto';
// import { RefreshTokenDto } from './dto/refresh-token.dto';

// @Controller('auth')
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}

//   @Get('nonce')
//   async getNonce(@Query() getNonceDto: GetNonceDto) {
//     return this.authService.getNonce(getNonceDto);
//   }

//   @Post('signup')
//   async signup(@Body() signupDto: WalletSignupDto) {
//     return this.authService.signup(signupDto);
//   }

//   @Post('login')
//   async login(@Body() loginDto: WalletLoginDto) {
//     return this.authService.login(loginDto);
//   }

//   @Post('refresh')
//   async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
//     return this.authService.refreshToken(refreshTokenDto.refreshToken);
//   }
// }
