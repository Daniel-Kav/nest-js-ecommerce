import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum ProductSortBy {
  NAME = 'name',
  PRICE = 'price',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class FindAllProductsDto {
  @IsOptional()
  @IsString()
  search?: string; // General search term for name, description, etc.

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number; // Filter by category

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number; // Filter by minimum price

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number; // Filter by maximum price

  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy; // Field to sort by

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC; // Sort order (ASC or DESC)

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10; // Number of items per page

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number = 0; // Number of items to skip
} 