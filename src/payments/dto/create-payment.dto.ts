import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 8, description: 'Order ID', required: true })
  @IsNumber()
  orderId: number;

  @ApiProperty({ example: 135.41, description: 'Payment amount', required: true })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'USD', description: 'Currency', required: true })
  @IsString()
  currency: string;

  @ApiProperty({ example: 'Credit Card', description: 'Payment method', required: true })
  @IsString()
  paymentMethod: string; // e.g., 'stripe', 'paypal'

  @ApiProperty({ example: 'txn_12345', description: 'Transaction ID', required: true })
  @IsString()
  transactionId: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING, description: 'Payment status', required: true })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiPropertyOptional({ description: 'Additional metadata (optional)' })
  @IsOptional()
  metadata?: any;
}
