import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/register-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ){}

  async register(createAuthDto: CreateAuthDto) {
    const existingUser = await this.usersService.findByEmail(createAuthDto.email);
    if (existingUser) throw new ConflictException('Email already in use 😒');
    const user = await this.usersService.create(createAuthDto);
    return user

  }
  async login(loginDto: LoginUserDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    console.log(user)
    if (!user || !(await user.comparePassword(loginDto.password))) {
      throw new UnauthorizedException('Invalid credentials !!😁');
    }
    const payload = {sub: user.id, email: user.email, role: user.role};
    const token = await this.jwtService.signAsync(payload);
    return {
      access_token: token,
      user
    };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
