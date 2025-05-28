import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Check,
  } from 'typeorm';
  import { User } from '../../users/entities/user.entity';
  import { Product } from '../../products/entities/product.entity';
  
  @Check('CHK_rating', 'rating BETWEEN 1 AND 5')
  @Entity('reviews')
  export class Review {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, (user) => user.reviews)
    @JoinColumn({ name: 'userId' })
    user: User;
  
    @Column()
    userId: number;
  
    @ManyToOne(() => Product, (product) => product.reviews)
    @JoinColumn({ name: 'productId' })
    product: Product;
  
    @Column()
    productId: number;
  
    @Column('int')
    rating: number;
  
    @Column('text', { nullable: true })
    comment: string;
  
    @Column({ default: true })
    isVerified: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

    constructor(review: Partial<Review>){
      Object.assign(this, review);
    }
  }