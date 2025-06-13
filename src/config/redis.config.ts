import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

export const RedisOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const redisUrl = configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set');
    }

    // Parse Redis URL
    const url = new URL(redisUrl);
    const password = url.password;
    const host = url.hostname;
    const port = parseInt(url.port);

    const store = await redisStore({
      socket: {
        host,
        port,
        tls: true,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000);
        },
        keepAlive: 10000,
        connectTimeout: 10000,
      },
      password,
      ttl: 60 * 60 * 24, // 1 day
      retryStrategy: (retries) => {
        if (retries > 10) {
          console.error('Redis operation failed after 10 retries');
          return new Error('Redis operation failed');
        }
        return Math.min(retries * 100, 3000);
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
    });

    return {
      store: () => store,
    };
  },
  inject: [ConfigService],
};