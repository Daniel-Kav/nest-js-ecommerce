import {
  Catch,
  HttpException,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../../logger/logger.service';

@Catch() // Catches all exceptions
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(LoggerService) private readonly loggerService: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extract message string from HttpException or use fallback
    let message: string;
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || JSON.stringify(res);
      } else {
        message = 'Internal server error';
      }
    } else {
      message = 'Internal server error';
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    // Log the exception to file
    this.loggerService.logError({
      exception: exception instanceof Error ? exception.stack : exception,
      ...errorResponse,
    });

    response.status(status).json(errorResponse);
  }
}
