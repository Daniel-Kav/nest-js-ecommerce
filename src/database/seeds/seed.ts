import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { faker } from '@faker-js/faker';
import { UserRole } from '../../common/enums/user-role.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [User, Category, Product, Order, OrderItem, Review, Payment, Cart, CartItem],
    synchronize: true, // or true if you want to sync in dev
    ssl: {
      rejectUnauthorized: true,
    },
  });
  // console.log('DB password:', process.env.DATABASE_PASSWORD);
  await dataSource.initialize();

  // --- Seed Categories ---
  const categoryRepo = dataSource.getRepository(Category);
  const categories: Category[] = [];
  for (let i = 0; i < 5; i++) {
    const category = categoryRepo.create({
      name: faker.commerce.department() + '_' + i,
      description: faker.lorem.sentence(),
      image: faker.image.url(),
      isActive: true,
    });
    categories.push(await categoryRepo.save(category));
  }

  // --- Seed Users ---
  const userRepo = dataSource.getRepository(User);
  const users: User[] = [];
  const admin = userRepo.create({
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    isEmailVerified: true,
  });
  users.push(await userRepo.save(admin));
  for (let i = 0; i < 10; i++) {
    const user = userRepo.create({
      email: faker.internet.email(),
      password: 'password123',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: UserRole.CUSTOMER,
      isEmailVerified: faker.datatype.boolean(),
    });
    users.push(await userRepo.save(user));
  }

  // --- Seed Products ---
  const productRepo = dataSource.getRepository(Product);
  const products: Product[] = [];
  for (let i = 0; i < 20; i++) {
    const product = productRepo.create({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      stockQuantity: faker.number.int({ min: 0, max: 100 }),
      images: [faker.image.url()],
      sku: faker.string.alphanumeric(8),
      isActive: true,
      categoryId: categories[faker.number.int({ min: 0, max: categories.length - 1 })].id,
    });
    products.push(await productRepo.save(product));
  }

  // --- Seed Carts and CartItems ---
  const cartRepo = dataSource.getRepository(Cart);
  const cartItemRepo = dataSource.getRepository(CartItem);
  for (const user of users) {
    const cart = cartRepo.create({
      userId: user.id,
      total: 0,
    });
    const savedCart = await cartRepo.save(cart);
    let cartTotal = 0;
    const cartItems: CartItem[] = [];
    for (let i = 0; i < faker.number.int({ min: 1, max: 5 }); i++) {
      const product = products[faker.number.int({ min: 0, max: products.length - 1 })];
      const quantity = faker.number.int({ min: 1, max: 3 });
      const item = cartItemRepo.create({
        userId: user.id,
        productId: product.id,
        quantity,
      });
      cartItems.push(await cartItemRepo.save(item));
      cartTotal += product.price * quantity;
    }
    savedCart.total = cartTotal;
    await cartRepo.save(savedCart);
  }

  // --- Seed Orders, OrderItems, Payments ---
  const orderRepo = dataSource.getRepository(Order);
  const orderItemRepo = dataSource.getRepository(OrderItem);
  const paymentRepo = dataSource.getRepository(Payment);
  for (const user of users) {
    for (let i = 0; i < faker.number.int({ min: 1, max: 3 }); i++) {
      const order = orderRepo.create({
        orderNumber: faker.string.alphanumeric(10),
        userId: user.id,
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        status: OrderStatus.PENDING,
        shippingAddress: {
          firstName: user.firstName,
          lastName: user.lastName,
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country(),
        },
      });
      const savedOrder = await orderRepo.save(order);
      let orderSubtotal = 0;
      const orderItems: OrderItem[] = [];
      for (let j = 0; j < faker.number.int({ min: 1, max: 4 }); j++) {
        const product = products[faker.number.int({ min: 0, max: products.length - 1 })];
        const quantity = faker.number.int({ min: 1, max: 3 });
        const price = product.price;
        const total = price * quantity;
        const item = orderItemRepo.create({
          orderId: savedOrder.id,
          productId: product.id,
          quantity,
          price,
          total,
        });
        orderItems.push(await orderItemRepo.save(item));
        orderSubtotal += total;
      }
      savedOrder.subtotal = orderSubtotal;
      savedOrder.tax = Math.round(orderSubtotal * 0.1 * 100) / 100;
      savedOrder.shipping = 10;
      savedOrder.total = Number(savedOrder.subtotal) + Number(savedOrder.tax) + Number(savedOrder.shipping);
      await orderRepo.save(savedOrder);
      // Payment
      const payment = paymentRepo.create({
        orderId: savedOrder.id,
        amount: savedOrder.total,
        currency: 'USD',
        paymentMethod: faker.helpers.arrayElement(['stripe', 'paypal']),
        transactionId: faker.string.alphanumeric(12),
        status: PaymentStatus.PAID,
        metadata: {},
      });
      await paymentRepo.save(payment);
    }
  }

  // --- Seed Reviews ---
  const reviewRepo = dataSource.getRepository(Review);
  for (const user of users) {
    for (let i = 0; i < faker.number.int({ min: 1, max: 5 }); i++) {
      const product = products[faker.number.int({ min: 0, max: products.length - 1 })];
      const review = reviewRepo.create({
        userId: user.id,
        productId: product.id,
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentences(2),
        isVerified: faker.datatype.boolean(),
      });
      await reviewRepo.save(review);
    }
  }

  await dataSource.destroy();
  console.log('Seeding complete!');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
}); 