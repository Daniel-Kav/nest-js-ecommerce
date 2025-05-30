import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum CartSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class FindAllCartsDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number; // Filter by user

  @IsOptional()
  @IsEnum(CartSortBy)
  sortBy?: CartSortBy; // Field to sort by

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