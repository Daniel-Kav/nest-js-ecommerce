import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { PaymentStatus } from '../../common/enums/payment-status.enum';
  import { Order } from '../../orders/entities/order.entity';
  
  @Entity('payments')
  export class Payment {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Order, (order) => order.payments)
    @JoinColumn({ name: 'orderId' })
    order: Order;
  
    @Column()
    orderId: number;
  
    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;
  
    @Column()
    currency: string;
  
    @Column()
    paymentMethod: string; // stripe, paypal, etc.
  
    @Column({ unique: true })
    transactionId: string;
  
    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;
  
    @Column('json', { nullable: true })
    metadata: any;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }