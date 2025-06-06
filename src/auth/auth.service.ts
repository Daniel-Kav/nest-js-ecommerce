import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/register-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { User } from 'src/users/entities/user.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ){}

  async register(createAuthDto: CreateAuthDto): Promise<any> {
    const existingUser = await this.usersService.findByEmail(createAuthDto.email);
    if (existingUser) throw new ConflictException('Email already in use 😒');
    // Hash the password
    const user = await this.usersService.create(createAuthDto);
    return instanceToPlain(user);
  }

  async generateRefreshToken(user: User): Promise<string> {
    const payload = { sub: user.id, email: user.email, tokenType: 'refresh' };
    // 7 days expiry for refresh token
    return this.jwtService.signAsync(payload, { expiresIn: '7d' });
  }

  async login(loginDto: LoginUserDto): Promise<{ access_token: string; refresh_token: string; user: Partial<User> }> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !(await user.comparePassword(loginDto.password))) {
      throw new UnauthorizedException('Invalid credentials !!😁');
    }
    const payload = {sub: user.id, email: user.email, role: user.role};
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.generateRefreshToken(user);
    // Save refresh token to user
    await this.usersService.update(user.id, { refreshToken: refresh_token });
    return {
      access_token,
      refresh_token,
      user: instanceToPlain(user)
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
