import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from 'src/common/enums/user-role.enum';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export enum UserSortBy {
  EMAIL = 'email',
  FIRST_NAME = 'firstName',
  LAST_NAME = 'lastName',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class FindAllUsersDto {
  @ApiPropertyOptional({ description: 'General search term for email, first name, last name', example: 'john' })
  @IsOptional()
  @IsString()
  search?: string; // General search term for email, first name, last name

  @ApiPropertyOptional({ enum: UserRole, description: 'Filter by user role', example: UserRole.CUSTOMER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole; // Filter by user role

  @ApiPropertyOptional({ enum: UserSortBy, description: 'Field to sort by', example: UserSortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(UserSortBy)
  sortBy?: UserSortBy; // Field to sort by

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