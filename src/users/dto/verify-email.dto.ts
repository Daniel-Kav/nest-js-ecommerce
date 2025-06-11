import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
