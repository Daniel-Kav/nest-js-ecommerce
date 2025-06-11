import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../../common/enums/user-role.enum';
import { Order } from '../../orders/entities/order.entity';
import { Review } from '../../reviews/entities/review.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  emailVerificationToken: string | null;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpires: Date;

  @Column({ nullable: true })
  @Exclude()
  refreshToken?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cartItems: CartItem[];

  @OneToMany(() => Cart, (cart) => cart.user)
  cart: Cart[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(plainTextPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, this.password);
  }
}
