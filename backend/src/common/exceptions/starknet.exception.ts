import { HttpException, HttpStatus } from '@nestjs/common';

export class StarknetException extends HttpException {
  constructor(message: string, cause?: Error) {
    super(
      {
        status: HttpStatus.BAD_REQUEST,
        message,
        cause: cause?.message,
      },
      HttpStatus.BAD_REQUEST,
    );
    this.stack = cause?.stack;
  }
}