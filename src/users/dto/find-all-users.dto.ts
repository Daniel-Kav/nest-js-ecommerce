import { IsOptional, IsString, IsNumber, IsEnum, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from 'src/common/enums/user-role.enum';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

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

  @ApiPropertyOptional({ 
    enum: UserSortBy, 
    description: 'Field to sort by', 
    example: UserSortBy.CREATED_AT,
    default: UserSortBy.CREATED_AT
  })
  @IsOptional()
  @IsEnum(UserSortBy)
  sortBy?: UserSortBy = UserSortBy.CREATED_AT; // Field to sort by

  @ApiPropertyOptional({ 
    enum: SortOrder, 
    description: 'Sort order (ASC or DESC)', 
    example: SortOrder.DESC,
    default: SortOrder.DESC
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC; // Sort order (ASC or DESC)

  @ApiPropertyOptional({ 
    description: 'Page number (1-based)', 
    example: 1,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Number of items per page (max: 100)', 
    example: 10,
    default: 10
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class FindAllUsersQueryDto extends FindAllUsersDto {}

export class FindAllUsersBodyDto extends PartialType(FindAllUsersDto) {}