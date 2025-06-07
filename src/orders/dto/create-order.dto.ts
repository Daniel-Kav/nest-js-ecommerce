import { IsNumber, IsArray, ValidateNested, IsObject, IsOptional, IsEnum, IsString, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty({ example: 1, description: 'Product ID', required: true })
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 2, description: 'Quantity of the product', required: true })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 21, description: 'Price per item', required: true })
  @IsNumber()
  @IsPositive()
  price: number;
}

class AddressDto {
  @ApiProperty({ example: 'John', description: 'First name', required: true })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name', required: true })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '123 Main St', description: 'Street address', required: true })
  @IsString()
  street: string;

  @ApiProperty({ example: 'Anytown', description: 'City', required: true })
  @IsString()
  city: string;

  @ApiProperty({ example: 'CA', description: 'State', required: true })
  @IsString()
  state: string;

  @ApiProperty({ example: '90210', description: 'Zip code', required: true })
  @IsString()
  zipCode: string;

  @ApiProperty({ example: 'USA', description: 'Country', required: true })
  @IsString()
  country: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto], description: 'Order items', required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @ApiProperty({ type: AddressDto, description: 'Shipping address', required: true })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ApiPropertyOptional({ type: AddressDto, description: 'Billing address (optional)' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress?: AddressDto;

  @ApiProperty({ example: 120.75, description: 'Subtotal', required: true })
  @IsNumber()
  subtotal: number;

  @ApiProperty({ example: 9.66, description: 'Tax', required: true })
  @IsNumber()
  tax: number;

  @ApiProperty({ example: 5.00, description: 'Shipping cost', required: true })
  @IsNumber()
  shipping: number;

  @ApiProperty({ example: 135.41, description: 'Total', required: true })
  @IsNumber()
  total: number;
}
