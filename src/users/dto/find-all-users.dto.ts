import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from 'src/common/enums/user-role.enum';

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
  @IsOptional()
  @IsString()
  search?: string; // General search term for email, first name, last name

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole; // Filter by user role

  @IsOptional()
  @IsEnum(UserSortBy)
  sortBy?: UserSortBy; // Field to sort by

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