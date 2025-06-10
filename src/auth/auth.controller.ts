import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
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
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/register-auth.dto';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Authentication')
@Controller('auth')
@ApiResponse({ status: 500, description: 'Internal server error' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ 
    description: 'User successfully registered',
    schema: {
      example: {
        user: {
          id: 1,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'CUSTOMER'
        },
        token: 'jwt.token.here'
      }
    }
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
    return this.authService.register(createAuthDto);
  }
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiOkResponse({
    description: 'User successfully logged in',
    schema: {
      example: {
        user: {
          id: 1,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'CUSTOMER'
        },
        access_token: 'jwt.token.here',
        refresh_token: 'refresh.token.here'
      }
    }
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
  async login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
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
