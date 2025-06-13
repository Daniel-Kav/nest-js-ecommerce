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
      },
      password,
      ttl: 60 * 60 * 24, // 1 day
    });

    return {
      store: () => store,
    };
  },
  inject: [ConfigService],
};