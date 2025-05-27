import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { CartModule } from './cart/cart.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [AuthModule, UsersModule, ProductsModule, CategoriesModule, OrdersModule, PaymentsModule, CartModule, ReviewsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
