import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}
