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
  import { Category } from '../../categories/entities/category.entity';
  import { OrderItem } from '../../orders/entities/order-item.entity';
  import { Review } from '../../reviews/entities/review.entity';
  import { CartItem } from '../../cart/entities/cart-item.entity';
  
  @Entity('products')
  export class Product {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column('text')
    description: string;
  
    @Column('decimal', { precision: 10, scale: 2 })
    price: number;
  
    @Column({ default: 0 })
    stockQuantity: number;
  
    @Column('simple-array', { nullable: true })
    images: string[];
  
    @Column({ nullable: true })
    sku: string;
  
    @Column({ default: true })
    isActive: boolean;
  
    @Column('decimal', { precision: 3, scale: 2, default: 0 })
    averageRating: number;
  
    @Column({ default: 0 })
    reviewCount: number;
  
    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'categoryId' })
    category: Category;
  
    @Column()
    categoryId: number;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
    orderItems: OrderItem[];
  
    @OneToMany(() => Review, (review) => review.product)
    reviews: Review[];
  
    @OneToMany(() => CartItem, (cartItem) => cartItem.product)
    cartItems: CartItem[];
  }
  