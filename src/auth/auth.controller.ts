import { Controller, Get, Post, Body, HttpCode, HttpStatus, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiExtraModels
} from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/register-auth.dto';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserResponseDto, UserWithTokenResponseDto } from 'src/users/dto/user-response.dto';

@ApiTags('Authentication')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
@ApiResponse({ status: 500, description: 'Internal server error' })
@ApiExtraModels(UserResponseDto, UserWithTokenResponseDto)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ 
    description: 'User successfully registered',
    type: UserWithTokenResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Bad Request - Validation error',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'password is too weak'],
        error: 'Bad Request'
      }
    }
  })
  @ApiBody({ type: CreateAuthDto })
  async register(@Body() createAuthDto: CreateAuthDto) {
    const result = await this.authService.register(createAuthDto);
    return plainToClass(UserWithTokenResponseDto, {
      ...result.user,
      accessToken: result.token,
      refreshToken: '' // Refresh token is not generated during registration
    }, { excludeExtraneousValues: true });
  }
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiOkResponse({ 
    description: 'User successfully logged in',
    type: UserWithTokenResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized'
      }
    }
  })
  @ApiBody({ type: LoginUserDto })
  async login(@Body() loginUserDto: LoginUserDto) {
    const result = await this.authService.login(loginUserDto);
    return plainToClass(UserWithTokenResponseDto, {
      ...result.user,
      accessToken: result.access_token,
      refreshToken: result.refresh_token
    }, { excludeExtraneousValues: true });
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiOkResponse({
    description: 'If the email exists, a password reset link will be sent',
    schema: {
      example: {
        success: true,
        message: 'If your email is registered, you will receive a password reset link.'
      }
    }
  })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user password' })
  @ApiOkResponse({
    description: 'Password successfully reset',
    schema: {
      example: {
        success: true,
        message: 'Password has been reset successfully.'
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Invalid or expired token',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid or expired password reset token',
        error: 'Bad Request'
      }
    }
  })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // @Post('refresh')
  // refresh(@Body('refresh_token') refreshToken: string) {
  //   return this.authService.refreshAccessToken(refreshToken);
  // }
}
