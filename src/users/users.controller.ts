import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, Inject, NotFoundException, HttpCode, ClassSerializerInterceptor, UseInterceptors as UseNestInterceptors } from '@nestjs/common';
import { CacheKey, CacheTTL, Cache, CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { plainToClass } from 'class-transformer';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { jwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FindAllUsersDto, FindAllUsersQueryDto, SortOrder } from './dto/find-all-users.dto';
import { ApiExtraModels, ApiBody, ApiTags, ApiQuery, ApiBearerAuth, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { PoliciesGuard } from 'src/common/guards/policies.guard';
import { CheckPolicies } from 'src/common/decorators/check-policies.decorator';
import { Action } from 'src/casl/actions.enum';
import { User } from './entities/user.entity';
import { AppAbility } from 'src/casl/ability.factory';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';
import { UserResponseDto, UserWithTokenResponseDto } from './dto/user-response.dto';

@ApiTags('Users')
@UseNestInterceptors(CacheInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@Controller('users')
@UseGuards(jwtAuthGuard, PoliciesGuard)
@ApiExtraModels(UpdateUserDto, UserResponseDto, UserWithTokenResponseDto)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  @Post('verify-email')
  @ApiBody({ type: VerifyEmailDto })
  @ApiOkResponse({ description: 'Email verified successfully' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.usersService.verifyEmail(verifyEmailDto);
  }

  @Get('test-cache')
  async testCache() {
    return await this.usersService.testCache();
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, User))
  async findAll(@Query() queryDto: FindAllUsersQueryDto) {
    // Always use pagination
    const { page = 1, limit = 10, ...filters } = queryDto;
    const pagination = new PaginationDto();
    pagination.page = Number(page);
    pagination.limit = Number(limit);
    
    // Get paginated users and transform each user to UserResponseDto
    const result = await this.usersService.findAllPaginated(pagination, filters);
    
    return {
      ...result,
      data: result.data.map(user => plainToClass(UserResponseDto, user, { excludeExtraneousValues: true }))
    };
  }
  @CacheTTL(60000)
  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, User))
  @ApiOkResponse({ 
    description: 'User found',
    type: UserResponseDto
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return plainToClass(UserResponseDto, user, { excludeExtraneousValues: true });
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, User))
  @ApiBody({ type: UpdateUserDto })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(200)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, User))
  async remove(@Param('id') id: string) {
    try {
      const result = await this.usersService.remove(+id);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Failed to delete user');
    }
  }
}
