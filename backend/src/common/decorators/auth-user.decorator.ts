// src/common/decorators/auth-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Extend Express Request interface to include 'user'
declare module 'express' {
  interface Request {
    user?: any;
  }
}

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);