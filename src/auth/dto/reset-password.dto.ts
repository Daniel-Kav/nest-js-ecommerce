import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'The reset token received via email' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ minLength: 6, description: 'New password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;
}
