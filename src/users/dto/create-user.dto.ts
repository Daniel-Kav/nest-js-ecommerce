import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address', required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPassword123!', description: 'User password', minLength: 6, required: true })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John', description: 'First name', required: true })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name', required: true })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number (optional)' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ 
    enum: UserRole, 
    enumName: 'UserRole',
    default: UserRole.CUSTOMER,
    description: 'User role (default: CUSTOMER)' 
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
