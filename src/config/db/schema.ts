// // src/database-schema.ts

// import { pgTable, serial, varchar, integer, boolean, timestamp, primaryKey, foreignKey, uniqueIndex, pgEnum, text, decimal, jsonb } from 'drizzle-orm/pg-core';
// import { relations } from "drizzle-orm";

// // Define enums based on your entities
// export const userRoleEnum = pgEnum('user_role', ['customer', 'admin']); // Assuming 'customer' and 'admin' based on UserRole enum
// export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']); // Add other statuses from your OrderStatus enum
// export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'PAID', 'FAILED', 'REFUNDED']); // Add other statuses from your PaymentStatus enum

// export const users = pgTable('users', {
//   id: serial('id').primaryKey(),
//   email: varchar('email', { length: 255 }).unique().notNull(), // Assuming max length 255 for varchar
//   password: varchar('password', { length: 255 }).notNull(), // Store hashed passwords
//   firstName: varchar('first_name', { length: 255 }).notNull(),
//   lastName: varchar('last_name', { length: 255 }).notNull(),
//   phone: varchar('phone', { length: 20 }), // Assuming max length 20 for phone
//   role: userRoleEnum('role').default('customer').notNull(),
//   isEmailVerified: boolean('is_email_verified').default(false).notNull(),
//   emailVerificationToken: varchar('email_verification_token', { length: 255 }),
//   passwordResetToken: varchar('password_reset_token', { length: 255 }),
//   passwordResetExpires: timestamp('password_reset_expires', { mode: 'date' }),
//   createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
//   updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().$onUpdate(() => new Date()).notNull(),
// });

// export const usersRelations = relations(users, ({ many }) => ({
//     orders: many(orders),
//     reviews: many(reviews),
//     cartItems: many(cartItems),
//     carts: many(carts), // Corrected relationship name to 'carts' based on User entity
// }));

// export const categories = pgTable('categories', {
//   id: serial('id').primaryKey(),
//   name: varchar('name', { length: 255 }).unique().notNull(),
//   description: text('description'),
//   image: varchar('image', { length: 255 }), // Assuming URL fits in varchar
//   isActive: boolean('is_active').default(true).notNull(),
//   createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
//   updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().$onUpdate(() => new Date()).notNull(),
// });

// export const categoriesRelations = relations(categories, ({ many }) => ({
//     products: many(products),
// }));

// export const products = pgTable('products', {
//   id: serial('id').primaryKey(),
//   name: varchar('name', { length: 255 }).notNull(),
//   description: text('description').notNull(),
//   price: decimal('price', { precision: 10, scale: 2 }).notNull(),
//   stockQuantity: integer('stock_quantity').default(0).notNull(),
//   images: text('images').array(), // Using text array for simple-array
//   sku: varchar('sku', { length: 255 }),
//   isActive: boolean('is_active').default(true).notNull(),
//   averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0.00').notNull(), // Default should match scale
//   reviewCount: integer('review_count').default(0).notNull(),
//   categoryId: integer('category_id').notNull(), // Foreign key column
//   createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
//   updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().$onUpdate(() => new Date()).notNull(),
// }, (table) => ({
//   // Define foreign key constraint
//   categoryFk: foreignKey(() => [table.categoryId], [categories.id]), // Correct foreignKey syntax
// }));

// export const productsRelations = relations(products, ({ one, many }) => ({
//     category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
//     orderItems: many(orderItems),
//     reviews: many(reviews),
//     cartItems: many(cartItems),
// }));

// export const orders = pgTable('orders', {
//   id: serial('id').primaryKey(),
//   orderNumber: varchar('order_number', { length: 255 }).unique().notNull(),
//   userId: integer('user_id').notNull(), // Foreign key column
//   subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
//   tax: decimal('tax', { precision: 10, scale: 2 }).default('0.00').notNull(),
//   shipping: decimal('shipping', { precision: 10, scale: 2 }).default('0.00').notNull(),
//   total: decimal('total', { precision: 10, scale: 2 }).notNull(),
//   status: orderStatusEnum('status').default('PENDING').notNull(),
//   shippingAddress: jsonb('shipping_address').notNull(),
//   billingAddress: jsonb('billing_address'),
//   createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
//   updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().$onUpdate(() => new Date()).notNull(),
// }, (table) => ({
//   // Define foreign key constraint
//   userFk: foreignKey(() => [table.userId], [users.id]), // Correct foreignKey syntax
// }));

// export const ordersRelations = relations(orders, ({ one, many }) => ({
//     user: one(users, { fields: [orders.userId], references: [users.id] }),
//     orderItems: many(orderItems),
//     payments: many(payments),
// }));

// export const orderItems = pgTable('order_items', {
//   id: serial('id').primaryKey(),
//   orderId: integer('order_id').notNull(), // Foreign key column
//   productId: integer('product_id').notNull(), // Foreign key column
//   quantity: integer('quantity').notNull(),
//   price: decimal('price', { precision: 10, scale: 2 }).notNull(),
//   total: decimal('total', { precision: 10, scale: 2 }).notNull(),
//   // Add compound primary key if needed, but serial id is primary key here
// }, (table) => ({
//   // Define foreign key constraints
//   orderFk: foreignKey(() => [table.orderId], [orders.id]), // Correct foreignKey syntax
//   productFk: foreignKey(() => [table.productId], [products.id]), // Correct foreignKey syntax
// }));

// export const orderItemsRelations = relations(orderItems, ({ one }) => ({
//     order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
//     product: one(products, { fields: [orderItems.productId], references: [products.id] }),
// }));

// export const reviews = pgTable('reviews', {
//   id: serial('id').primaryKey(),
//   userId: integer('user_id').notNull(), // Foreign key column
//   productId: integer('product_id').notNull(), // Foreign key column
//   rating: integer('rating').notNull(), // CHECK constraint is database-level, not in schema def typically
//   comment: text('comment'),
//   isVerified: boolean('is_verified').default(true).notNull(),
//   createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
//   updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().$onUpdate(() => new Date()).notNull(),
// }, (table) => ({
//   // Define foreign key constraints
//   userFk: foreignKey(() => [table.userId], [users.id]), // Correct foreignKey syntax
//   productFk: foreignKey(() => [table.productId], [products.id]), // Correct foreignKey syntax
//   // CHECK constraint 'CHK_rating' would be applied in migration or manually
// }));

// export const reviewsRelations = relations(reviews, ({ one }) => ({
//     user: one(users, { fields: [reviews.userId], references: [users.id] }),
//     product: one(products, { fields: [reviews.productId], references: [products.id] }),
// }));

// export const payments = pgTable('payments', {
//   id: serial('id').primaryKey(),
//   orderId: integer('order_id').notNull(), // Foreign key column
//   amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
//   currency: varchar('currency', { length: 10 }).notNull(), // Assuming reasonable length for currency code
//   paymentMethod: varchar('payment_method', { length: 50 }).notNull(), // Assuming reasonable length
//   transactionId: varchar('transaction_id', { length: 255 }).unique().notNull(),
//   status: paymentStatusEnum('status').default('PENDING').notNull(),
//   metadata: jsonb('metadata'),
//   createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
//   updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().$onUpdate(() => new Date()).notNull(),
// }, (table) => ({
//   // Define foreign key constraint
//   orderFk: foreignKey(() => [table.orderId], [orders.id]), // Correct foreignKey syntax
// }));

// export const paymentsRelations = relations(payments, ({ one }) => ({
//     order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
// }));

// export const carts = pgTable('carts', {
//   id: serial('id').primaryKey(),
//   userId: integer('user_id').notNull(), // Foreign key column
//   total: decimal('total', { precision: 10, scale: 2 }).default('0.00').notNull(),
//   createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
//   updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().$onUpdate(() => new Date()).notNull(),
// }, (table) => ({
//   // Define foreign key constraint
//   userFk: foreignKey(() => [table.userId], [users.id]), // Correct foreignKey syntax
// }));

// export const cartsRelations = relations(carts, ({ one, many }) => ({
//     user: one(users, { fields: [carts.userId], references: [users.id] }),
//     items: many(cartItems),
// }));

// export const cartItems = pgTable('cart_items', {
//   id: serial('id').primaryKey(),
//   userId: integer('user_id').notNull(), // Foreign key column
//   productId: integer('product_id').notNull(), // Foreign key column
//   quantity: integer('quantity').notNull(),
//   createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
//   updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().$onUpdate(() => new Date()).notNull(),
// }, (table) => ({
//   // Define foreign key constraints
//   userFk: foreignKey(() => [table.userId], [users.id]), // Correct foreignKey syntax
//   productFk: foreignKey(() => [table.productId], [products.id]), // Correct foreignKey syntax
// }));

// export const cartItemsRelations = relations(cartItems, ({ one }) => ({
//     user: one(users, { fields: [cartItems.userId], references: [users.id] }),
//     product: one(products, { fields: [cartItems.productId], references: [products.id] }),
// }));