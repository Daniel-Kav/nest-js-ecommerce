import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerModuleOptions = {
  ttl: 60, // Time window in seconds (1 minute)
  limit: 100, // Maximum number of requests within the TTL
  // Note: errorMessage is not part of the type definition in v4.2.1
  // Custom error messages should be handled in a custom ThrottlerGuard
};
