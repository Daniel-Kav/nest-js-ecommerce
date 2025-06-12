import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

export const RedisOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = configService.get<string>('REDIS_PASSWORD');

    const store = await redisStore({
      socket: {
        host: redisHost,
        port: Number(redisPort),
      },
      ...(redisPassword && { password: redisPassword }),
      ttl: 60 * 60 * 24, // 1 day
    });

    return {
      store: () => store,
    };
  },
  inject: [ConfigService],
};