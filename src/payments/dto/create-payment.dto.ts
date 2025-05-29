import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

export class CreatePaymentDto {
  @IsNumber()
  orderId: number;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  paymentMethod: string; // e.g., 'stripe', 'paypal'

  @IsString()
  transactionId: string;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsOptional()
  metadata?: any;
}
