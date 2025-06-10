import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, FindManyOptions, Like, MoreThan, FindOptionsWhere } from 'typeorm';
import { FindAllUsersDto, SortOrder, UserSortBy } from './dto/find-all-users.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { instanceToPlain } from 'class-transformer';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    // Ensure the passwordResetToken and passwordResetExpires columns exist in the User entity
    // This is a workaround for TypeORM not detecting the new columns immediately
    const metadata = this.userRepository.metadata;
    if (!metadata.findColumnWithPropertyName('passwordResetToken')) {
      metadata.columns.push(
        new (require('typeorm').ColumnMetadata)({
          propertyName: 'passwordResetToken',
          target: metadata.target,
          propertyPath: 'passwordResetToken',
          mode: 'regular',
          options: { nullable: true },
          type: 'varchar',
          isNullable: true,
          isGenerated: false,
          isPrimary: false,
          isUnique: false,
        })
      );
    }
    if (!metadata.findColumnWithPropertyName('passwordResetExpires')) {
      metadata.columns.push(
        new (require('typeorm').ColumnMetadata)({
          propertyName: 'passwordResetExpires',
          target: metadata.target,
          propertyPath: 'passwordResetExpires',
          mode: 'regular',
          options: { nullable: true },
          type: 'timestamp',
          isNullable: true,
          isGenerated: false,
          isPrimary: false,
          isUnique: false,
        })
      );
    }
  }

  async create(createUserDto: CreateUserDto): Promise<any> {
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);
    return instanceToPlain(savedUser);
  }

  async findAll(findAllUsersDto: FindAllUsersDto = {}): Promise<ApiResponse<User[]>> {
    const { search, role } = findAllUsersDto;
    
    const options: FindManyOptions<User> = {
      where: {}
    };

    if (search) {
      options.where = [
        { email: Like(`%${search}%`) },
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
      ];
    }

    if (role) {
      if (Array.isArray(options.where)) {
        options.where = options.where.map(where => ({ ...where, role }));
      } else {
        (options.where as any).role = role;
      }
    }
    
    try {
      const users = await this.userRepository.find(options);
      return { 
        success: true, 
        data: users,
        message: 'Users retrieved successfully' 
      };
    } catch (error) {
      console.error('Error finding users:', error);
      throw error;
    }
  }

  /**
   * Find all users with pagination
   * @param pagination Pagination options (page, limit)
   * @param filters Additional filters (search, role, etc.)
   * @returns Paginated response of users
   */
  async findAllPaginated(
    pagination: PaginationDto,
    filters: Omit<FindAllUsersDto, 'page' | 'limit'> = {}
  ): Promise<PaginatedResponseDto<User>> {
    const { search, sortBy = 'createdAt', order = 'DESC', role } = filters;
    
    const where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = {};
    
    if (search) {
      where['$or'] = [
        { email: Like(`%${search}%`) },
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
      ];
    }

    if (role) {
      where['role'] = role;
    }

    const [users, total] = await this.userRepository.findAndCount({
      where,
      order: { [sortBy]: order } as Record<string, 'ASC' | 'DESC'>,
      skip: pagination.skip,
      take: pagination.limit,
    });

    return new PaginatedResponseDto(users, total, pagination);
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

  async findByResetToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { 
        passwordResetToken: token,
        passwordResetExpires: MoreThan(new Date())
      } 
    });
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
