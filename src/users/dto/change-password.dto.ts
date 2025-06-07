import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!', description: 'Current password', minLength: 6, required: true })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword456!', description: 'New password', minLength: 6, required: true })
  @IsString()
  @MinLength(6)
  newPassword: string;
} 