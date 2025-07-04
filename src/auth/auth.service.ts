import { ConflictException, Injectable, UnauthorizedException, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { UserRole } from '../common/enums/user-role.enum';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { CreateAuthDto } from './dto/register-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { instanceToPlain } from 'class-transformer';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { User } from 'src/users/entities/user.entity';
import * as crypto from 'crypto';
import { EmailService } from 'src/email/email.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  async register(createAuthDto: CreateAuthDto): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(createAuthDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Create user with CUSTOMER role
    const userData = {
      ...createAuthDto,
      role: UserRole.CUSTOMER // Default role
    };
    const user = await this.usersService.create(userData);

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      user,
      token,
    };
  }

  private async generateRefreshToken(user: User | Record<string, any>): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };
    return this.jwtService.signAsync(payload, { expiresIn: '7d' });
  }

  async login(loginDto: LoginUserDto): Promise<{ access_token: string; refresh_token: string; user: Record<string, any> }> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !(await user.comparePassword(loginDto.password))) {
      throw new UnauthorizedException('Invalid credentials !!😁');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.generateRefreshToken(user);

    // Save refresh token to user
    await this.usersService.update(user.id, { refreshToken: refresh_token });

    // Convert to plain object to ensure no sensitive data is exposed
    const userResponse = instanceToPlain(user);

    return {
      access_token,
      refresh_token,
      user: userResponse
    };
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string; previewUrl?: string }> {
    const user = await this.usersService.findByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true, message: 'If an account with that email exists, a password reset link has been sent' };
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save the token to the user
    await this.usersService.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetTokenExpiry,
    } as UpdateUserDto);

    // Send email with reset link
    const { success, error, previewUrl } = await this.emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.firstName || 'User'
    );

    if (!success) {
      this.logger.error(`Failed to send password reset email: ${error}`);
      // For testing purposes, return the preview URL if available
      if (previewUrl) {
        return {
          success: true,
          message: 'Password reset email sent (test mode)',
          previewUrl
        };
      }
      throw new InternalServerErrorException('Failed to send password reset email');
    }

    return {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ success: boolean; message: string }> {
    // Find user by reset token and check if it's not expired
    const user = await this.usersService.findByResetToken(resetPasswordDto.token);

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    // Create a temporary user instance to hash the password
    const tempUser = new User();
    tempUser.password = resetPasswordDto.password;
    await tempUser.hashPassword();

    // Update password and clear reset token
    await this.usersService.update(user.id, {
      password: tempUser.password, // This is now the hashed password
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    } as UpdateUserDto);

    return {
      success: true,
      message: 'Password has been reset successfully'
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      if (payload.tokenType !== 'refresh') throw new UnauthorizedException('Invalid refresh token');
      const user = await this.usersService.findOne(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      // Issue new tokens
      const accessPayload = { sub: user.id, email: user.email, role: user.role };
      const access_token = await this.jwtService.signAsync(accessPayload);
      const new_refresh_token = await this.generateRefreshToken(user);
      await this.usersService.update(user.id, { refreshToken: new_refresh_token });
      return { access_token, refresh_token: new_refresh_token };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
