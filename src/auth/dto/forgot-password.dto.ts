import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com', description: 'User\'s email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
