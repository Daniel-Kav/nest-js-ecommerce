import { IsNumber, IsString, IsOptional, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 10, description: 'User ID', required: true })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 1, description: 'Product ID', required: true })
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 5, description: 'Rating (1-5)', required: true, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Great product!', description: 'Review comment (optional)' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ example: true, description: 'Is review verified? (optional)' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
