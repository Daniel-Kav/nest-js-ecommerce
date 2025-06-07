import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ReviewSortBy {
  RATING = 'rating',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class FindAllReviewsDto {
  @ApiPropertyOptional({ description: 'Search term for comment content', example: 'great' })
  @IsOptional()
  @IsString()
  search?: string; // Search term for comment content

  @ApiPropertyOptional({ description: 'Filter by product ID', example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  productId?: number; // Filter by product

  @ApiPropertyOptional({ description: 'Filter by user ID', example: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number; // Filter by user

  @ApiPropertyOptional({ description: 'Filter by specific rating', example: 5, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating?: number; // Filter by specific rating

  @ApiPropertyOptional({ description: 'Filter by minimum rating', example: 4, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  minRating?: number; // Filter by minimum rating

  @ApiPropertyOptional({ description: 'Filter by maximum rating', example: 5, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  maxRating?: number; // Filter by maximum rating

  @ApiPropertyOptional({ enum: ReviewSortBy, description: 'Field to sort by', example: ReviewSortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(ReviewSortBy)
  sortBy?: ReviewSortBy; // Field to sort by

  @ApiPropertyOptional({ enum: SortOrder, description: 'Sort order (ASC or DESC)', example: SortOrder.ASC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC; // Sort order (ASC or DESC)

  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10; // Number of items per page

  @ApiPropertyOptional({ description: 'Number of items to skip', example: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number = 0; // Number of items to skip
} 