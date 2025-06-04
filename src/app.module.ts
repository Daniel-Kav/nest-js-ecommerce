import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { CartModule } from './cart/cart.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/db.config';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { createKeyv, Keyv } from '@keyv/redis';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheableMemory } from 'cacheable';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { LoggerMiddleware } from './common/logger.middleware';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule, UsersModule, ProductsModule, CategoriesModule, OrdersModule, PaymentsModule, CartModule, ReviewsModule,
    RedisModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        return {
          ttl: 60000, // 60 sec: Cache time-to-live
          stores: [
            new Keyv({
              store: new CacheableMemory({
                ttl: 60 * 60 * 1000,
                lruSize: 5000,
              }),
            }),
            createKeyv('redis://default:123456789!@localhost:6379'),
          ],
        };
      },
    }),
    
  ],
  controllers: [],
  providers: [ {
    provide: APP_INTERCEPTOR,
    useClass: CacheInterceptor,}     
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
