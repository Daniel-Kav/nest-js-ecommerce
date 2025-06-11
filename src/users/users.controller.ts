import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, Inject, NotFoundException, HttpCode } from '@nestjs/common';
import { CacheKey, CacheTTL, Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { jwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { FindAllUsersDto, FindAllUsersQueryDto, SortOrder } from './dto/find-all-users.dto';
import { ApiExtraModels, ApiBody, ApiTags, ApiQuery, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { PoliciesGuard } from 'src/common/guards/policies.guard';
import { CheckPolicies } from 'src/common/decorators/check-policies.decorator';
import { Action } from 'src/casl/actions.enum';
import { User } from './entities/user.entity';
import { AppAbility } from 'src/casl/ability.factory';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(jwtAuthGuard, PoliciesGuard)
@ApiExtraModels(UpdateUserDto)
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

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, User))
  @ApiOkResponse({ description: 'List of users with pagination metadata' })
  async findAll(@Query() queryDto: FindAllUsersQueryDto) {
    // Always use pagination
    const { page = 1, limit = 10, ...filters } = queryDto;
    const pagination = new PaginationDto();
    pagination.page = Number(page);
    pagination.limit = Number(limit);

    return this.usersService.findAllPaginated(pagination, filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
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
