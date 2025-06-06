import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuthDto {
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
}