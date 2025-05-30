import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
  } from 'typeorm';
  import { OrderStatus } from '../../common/enums/order-status.enum';
  import { User } from '../../users/entities/user.entity';
  import { OrderItem } from './order-item.entity';
  import { Payment } from '../../payments/entities/payment.entity';
  
  @Entity('orders')
  export class Order {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    orderNumber: string;
  
    @ManyToOne(() => User, (user) => user.orders)
    @JoinColumn({ name: 'userId' })
    user: User;
  
    @Column()
    userId: number;
  
    @Column('decimal', { precision: 10, scale: 2 })
    subtotal: number;
  
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    tax: number;
  
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    shipping: number;
  
    @Column('decimal', { precision: 10, scale: 2 })
    total: number;
  
    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;
  
    @Column('json')
    shippingAddress: {
      firstName: string;
      lastName: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  
    @Column('json', { nullable: true })
    billingAddress: {
      firstName: string;
      lastName: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
    orderItems: OrderItem[];
  
    @OneToMany(() => Payment, (payment) => payment.order, { onDelete: 'CASCADE' })
    payments: Payment[];
  }
  