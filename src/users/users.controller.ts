import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, Inject, NotFoundException, HttpCode } from '@nestjs/common';
import { CacheKey, CacheTTL, Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { jwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { ApiExtraModels, ApiBody, ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(jwtAuthGuard)
@ApiExtraModels(UpdateUserDto)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Get()
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAll(@Query() queryDto: FindAllUsersDto) {
    // Generate cache key based on query parameters
    const cacheKey = `users:${JSON.stringify(queryDto)}`;
    
    // Try to get from cache
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // If not in cache, get from service
    const result = await this.usersService.findAll(queryDto);
    
    // Cache the result
    await this.cacheManager.set(cacheKey, result, 60000); // 60 seconds
    
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateUserDto })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
  @Delete(':id')
  @HttpCode(200)
  @UseGuards(jwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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
