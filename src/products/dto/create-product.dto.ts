import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, IsPositive, Min, ArrayNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNumber()
  categoryId: number;
}
