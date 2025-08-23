import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, query } = request;
    
    this.logger.log(
      `Request: ${method} ${url} \nBody: ${JSON.stringify(body)} \nParams: ${JSON.stringify(params)} \nQuery: ${JSON.stringify(query)}`
    );

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        this.logger.log(
          `Response: ${method} ${url} ${response.statusCode} - ${Date.now() - now}ms`
        );
      })
    );
  }
}