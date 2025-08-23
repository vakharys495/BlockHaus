// src/config/app.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV,
  name: process.env.APP_NAME,
  port: parseInt(process.env.PORT ?? '', 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api',
  frontendUrl: process.env.FRONTEND_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
}));