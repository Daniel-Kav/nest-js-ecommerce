import { IsNumber, IsArray, ValidateNested, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateCartItemDto {
  @ApiProperty({ example: 1, description: 'Product ID', required: true })
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 2, description: 'Quantity of the product', required: true })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateCartDto {
  @ApiProperty({ example: 10, description: 'User ID', required: true })
  @IsNumber()
  userId: number;

  @ApiPropertyOptional({ type: [CreateCartItemDto], description: 'Cart items (optional)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemDto)
  items?: CreateCartItemDto[];

  @ApiPropertyOptional({ example: 100, description: 'Total price (optional)' })
  @IsOptional()
  @IsNumber()
  total?: number;
}
