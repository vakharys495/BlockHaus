import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(errors: Record<string, string[]>) {
    super(
      {
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Validation failed',
        errors,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}