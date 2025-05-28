import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Order } from './order.entity';
  import { Product } from '../../products/entities/product.entity';
  
  @Entity('order_items')
  export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Order, (order) => order.orderItems)
    @JoinColumn({ name: 'orderId' })
    order: Order;
  
    @Column()
    orderId: number;
  
    @ManyToOne(() => Product, (product) => product.orderItems)
    @JoinColumn({ name: 'productId' })
    product: Product;
  
    @Column()
    productId: number;
  
    @Column()
    quantity: number;
  
    @Column('decimal', { precision: 10, scale: 2 })
    price: number;
  
    @Column('decimal', { precision: 10, scale: 2 })
    total: number;
  }