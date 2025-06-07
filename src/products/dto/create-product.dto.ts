import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, IsPositive, Min, ArrayNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Gaming Mouse', description: 'Product name', required: true })
  @IsString()
  name: string;

  @ApiProperty({ example: 'High precision gaming mouse.', description: 'Product description', required: true })
  @IsString()
  description: string;

  @ApiProperty({ example: 50, description: 'Product price', required: true })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 100, description: 'Stock quantity', required: true })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiPropertyOptional({ example: ['URL_ADDRESS.com/mouse1.jpg', 'URL_ADDRESS.com/mouse2.jpg'], description: 'Product images (optional)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: 'GM-2025-001', description: 'SKU (optional)' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: true, description: 'Is product active? (optional)' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 1, description: 'Category ID', required: true })
  @IsNumber()
  categoryId: number;
}
