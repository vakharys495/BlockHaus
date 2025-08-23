import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

import { StarknetException } from '../exceptions/starknet.exception';

@Catch(StarknetException)
export class StarknetExceptionFilter implements ExceptionFilter {
  catch(exception: StarknetException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      cause: exception.cause,
      timestamp: new Date().toISOString(),
    });
  }
}