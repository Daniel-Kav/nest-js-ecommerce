import { Inject, Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, FindManyOptions, Like, MoreThan, FindOptionsWhere } from 'typeorm';
import { FindAllUsersDto, SortOrder, UserSortBy } from './dto/find-all-users.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EmailService } from 'src/email/email.service';
import { UserRole } from 'src/common/enums/user-role.enum';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly emailService: EmailService,
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

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Set default role if not provided
    const userData = {
      ...createUserDto,
      role: createUserDto.role || UserRole.CUSTOMER
    };
    
    const user = this.userRepository.create(userData);
    user.isEmailVerified = false;
    user.emailVerificationToken = uuidv4();
    
    // Password will be hashed by the @BeforeInsert() hook in the User entity
    
    // Log the verification token for testing
    this.logger.log(`Creating user with email: ${user.email}`);
    
    try {
      // Send verification email
      const emailResult = await this.emailService.sendVerificationEmail(
        user.email,
        user.emailVerificationToken,
        `${user.firstName} ${user.lastName}`
      );
      
      if (!emailResult.success) {
        throw new BadRequestException('Failed to send verification email');
      }
      
      const savedUser = await this.userRepository.save(user);
      this.logger.log(`User created successfully with ID: ${savedUser.id}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<ApiResponse> {
    // First find the user with the raw query to bypass entity hooks
    const users = await this.userRepository.query(
      'SELECT * FROM users WHERE email = $1 AND "emailVerificationToken" = $2 AND "isEmailVerified" = false',
      [verifyEmailDto.email, verifyEmailDto.token]
    );

    if (!users || users.length === 0) {
      throw new BadRequestException('Invalid verification token or email. Please ensure:\n1. The token matches exactly what was sent to your email\n2. The email address is correct\n3. You haven\'t already verified your account');
    }

    const user = users[0];
    
    // Use update with raw query to avoid triggering entity hooks
    await this.userRepository.query(
      'UPDATE users SET "isEmailVerified" = true, "emailVerificationToken" = NULL WHERE id = $1',
      [user.id]
    );

    // Clear the user from cache if exists
    await this.cacheManager.del(`users:detail:${user.id}`);

    return {
      success: true,
      message: 'Email verified successfully'
    };
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

    // Create a cache key based on the route and query params
    const cacheKey = `users:list:${JSON.stringify({ pagination, filters })}`;
    const cacheTTL = 180; // 3 minutes
    let cachedResult = await this.cacheManager.get<PaginatedResponseDto<User>>(cacheKey);
    if (cachedResult) {
      console.log(`[CACHE HIT] User list from cache for key: ${cacheKey}`);
      console.log(`[CACHE GOT] Returning user list from cache for key: ${cacheKey}`);
      return cachedResult;
    }
    console.log(`[CACHE MISS] Fetching user list from DB for key: ${cacheKey}`);
    const [users, total] = await this.userRepository.findAndCount({
      where,
      order: { [sortBy]: order } as Record<string, 'ASC' | 'DESC'>,
      skip: pagination.skip,
      take: pagination.limit,
    });

    const result = new PaginatedResponseDto(users, total, pagination);
    await this.cacheManager.set(cacheKey, result, cacheTTL);
    console.log(`[CACHE SET] User list cached for key: ${cacheKey}`);
    return result;
  }

  async findOne(id: number): Promise<Record<string, any>> {
    const cacheKey = `users:detail:${id}`;
    const cacheTTL = 5 * 60 * 1000; // 5 minutes
    
    // Check cache first
    const cachedUser = await this.cacheManager.get<Record<string, any>>(cacheKey);
    if (cachedUser) {
      this.logger.log(`[CACHE HIT] User detail from cache for key: ${cacheKey}`);
      return cachedUser;
    }
    
    this.logger.log(`[CACHE MISS] Fetching user detail from DB for key: ${cacheKey}`);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Convert to plain object and remove sensitive data
    const plainUser = instanceToPlain(user);
    
    // Cache the user data
    await this.cacheManager.set(cacheKey, plainUser, cacheTTL);
    this.logger.log(`[CACHE SET] User detail cached for key: ${cacheKey}`);
    
    return plainUser as Record<string, any>;
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
    
    // If updating password, we need to ensure it's hashed
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }
    
    // Update the user
    await this.userRepository.update(id, updateUserDto);
    
    // Invalidate user detail cache
    await this.cacheManager.del(`users:detail:${id}`);
    
    // If updating email or other critical fields, you might want to invalidate more caches
    if (updateUserDto.email) {
      // Invalidate any caches that might be using the old email
      await this.cacheManager.del(`users:email:${user.email}`);
    }
    
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
      // Invalidate user detail and list cache
      await this.cacheManager.del(`users:detail:${id}`);
      // Optionally, clear all list caches (could be improved with a pattern if supported)
      // await this.cacheManager.reset();
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

  /**
   * Test Redis cache connection by setting and getting a test value with 5 min TTL
   */
  async testCache(): Promise<{ success: boolean; message: string }> {
    const testKey = 'test:redis:connection';
    const testValue = { time: new Date().toISOString(), message: 'Hello from Redis!' };
    try {
      await this.cacheManager.set(testKey, testValue, 300); // 5 minutes TTL
      console.log(`[REDIS TEST] Set key '${testKey}' with value:`, testValue);
    } catch (err) {
      console.error(`[REDIS TEST ERROR] Error setting key '${testKey}':`, err);
      return { success: false, message: `Error setting key: ${err.message}` };
    }
    try {
      const value = await this.cacheManager.get(testKey);
      console.log(`[REDIS TEST] Got value for key '${testKey}':`, value);
      return { success: true, message: `Successfully set and got key '${testKey}' with 5 min TTL.` };
    } catch (err) {
      console.error(`[REDIS TEST ERROR] Error getting key '${testKey}':`, err);
      return { success: false, message: `Error getting key: ${err.message}` };
    }
  }
}
