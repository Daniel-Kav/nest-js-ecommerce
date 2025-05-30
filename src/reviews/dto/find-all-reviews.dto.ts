import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReviewSortBy {
  RATING = 'rating',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class FindAllReviewsDto {
  @IsOptional()
  @IsString()
  search?: string; // Search term for comment content

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  productId?: number; // Filter by product

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number; // Filter by user

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating?: number; // Filter by specific rating

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  minRating?: number; // Filter by minimum rating

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  maxRating?: number; // Filter by maximum rating

  @IsOptional()
  @IsEnum(ReviewSortBy)
  sortBy?: ReviewSortBy; // Field to sort by

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