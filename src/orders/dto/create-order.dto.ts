import { IsNumber, IsArray, ValidateNested, IsObject, IsOptional, IsEnum, IsString, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsPositive()
  price: number;
}

class AddressDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;

  @IsString()
  country: string;
}

export class CreateOrderDto {
  @IsNumber()
  userId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress?: AddressDto;

  @IsNumber()
  subtotal: number;

  @IsNumber()
  tax: number;

  @IsNumber()
  shipping: number;

  @IsNumber()
  total: number;
}
