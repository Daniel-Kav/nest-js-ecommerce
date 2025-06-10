import { ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected errorMessage = 'Too many requests, please try again later.';

  async handleRequest(context: ExecutionContext, limit: number, ttl: number): Promise<boolean> {
    try {
      return await super.handleRequest(context, limit, ttl);
    } catch (error) {
      if (error instanceof Error && error.message.includes('ThrottlerException')) {
        throw new Error(this.errorMessage);
      }
      throw error;
    }
  }
}
