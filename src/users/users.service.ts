import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { FindAllUsersDto, UserSortBy, SortOrder } from './dto/find-all-users.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { instanceToPlain } from 'class-transformer';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);
    return instanceToPlain(savedUser);
  }

  async findAll(queryDto: FindAllUsersDto): Promise<any[]> {
    const { search, role, sortBy, sortOrder, limit, offset } = queryDto;
    const findOptions: FindManyOptions<User> = {
      where: {},
      order: {},
      take: limit,
      skip: offset,
    };
    if (search) {
      findOptions.where = [
        { email: Like(`%${search}%`) },
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
      ];
    }
    if (role) {
      if (Array.isArray(findOptions.where)) {
        findOptions.where = findOptions.where.map(condition => ({ ...condition, role: role }));
      } else {
        findOptions.where = { ...findOptions.where, role: role };
      }
    }
    const whereIsEmpty = findOptions.where === undefined ||
                         (Array.isArray(findOptions.where) && findOptions.where.length === 0) ||
                         (!Array.isArray(findOptions.where) && Object.keys(findOptions.where).length === 0);
    if (whereIsEmpty) {
        delete findOptions.where;
    }
    // Use a cache key based on the query
    const cacheKey = 'users';
    console.log('Using cacheKey:', cacheKey);

    let cachedUsers;
    try {
      cachedUsers = await this.cacheManager.get(cacheKey);
      if (cachedUsers) {
        console.log('Redis GET success: returning users from Redis for', cacheKey);
        return cachedUsers;
      } else {
        console.log('Redis GET: cache miss, querying DB for', cacheKey);
      }
    } catch (err) {
      console.error('Redis GET failed:', err);
    }
    const users = await this.userRepository.find(findOptions);
    try {
      await this.cacheManager.set(cacheKey, users.map(user => instanceToPlain(user)), 60);
      console.log('Redis SET success: users cached for', cacheKey);
    } catch (err) {
      console.error('Redis SET failed:', err);
    }
    return users.map(user => instanceToPlain(user));
  }

  async findOne(id: number): Promise<any> {
    await this.cacheManager.set('testkey', 'testvalue', 600);
    const testVal = await this.cacheManager.get('testkey');
    console.log('Test Redis value:', testVal);
    
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return instanceToPlain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<ApiResponse> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return {
        success: false,
        message: `User with ID ${id} not found`
      };
    }
    await this.userRepository.update(id, updateUserDto);
    return {
      success: true,
      message: 'User updated successfully'
    };
  }
  async remove(id: number): Promise<ApiResponse> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    try {
      await this.userRepository.delete(id);
      
      // Clear user from cache if it exists
      const cacheKey = 'users';
      await this.cacheManager.del(cacheKey);
      
      return {
        success: true,
        message: 'User deleted successfully',
        data: { id }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete user',
      };
    }
  }
}
