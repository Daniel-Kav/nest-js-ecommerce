import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    // CacheModule.register({
    //   isGlobal: true,
    //   ttl: 5000,
    //   // store: createKeyv('redis://localhost:6379')
    // }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule, UsersModule, ProductsModule, CategoriesModule, OrdersModule, PaymentsModule, CartModule, ReviewsModule,
    CacheModule.registerAsync({
      useFactory: async () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            createKeyv('redis://localhost:6379'),
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
export class AppModule {}
