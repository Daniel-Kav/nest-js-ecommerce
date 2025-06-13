import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpStatus, UseGuards, Req, Query, ForbiddenException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Request } from 'express';
import { FindAllReviewsDto } from './dto/find-all-reviews.dto';
import { ApiExtraModels, ApiBody, ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { jwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PoliciesGuard } from 'src/common/guards/policies.guard';
import { CheckPolicies } from 'src/common/decorators/check-policies.decorator';
import { Action } from 'src/casl/actions.enum';
import { Review } from './entities/review.entity';
import { AppAbility } from 'src/casl/ability.factory';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('reviews')
@UseGuards(jwtAuthGuard, PoliciesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Review))
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createReviewDto: CreateReviewDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.reviewsService.create(createReviewDto, userId);
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Review))
  @ApiResponse({ status: 200, description: 'List of reviews' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() queryDto: FindAllReviewsDto) {
    return this.reviewsService.findAll(queryDto);
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Review))
  @ApiResponse({ status: 200, description: 'Review found' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: number,
  ) {
    const review = await this.reviewsService.findOne(id);
    return review;
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Review))
  @ApiBody({ type: UpdateReviewDto })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id') id: string, 
    @Body() updateReviewDto: UpdateReviewDto, 
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    const review = await this.reviewsService.findOne(+id);
    
    // Check if user is the owner or has admin role
    const ability: AppAbility = (req as any).ability;
    if (!ability.can(Action.Update, review)) {
      throw new ForbiddenException('You are not allowed to update this review');
    }
    
    return this.reviewsService.update(+id, updateReviewDto, userId);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Review))
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(
    @Param('id') id: string, 
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    const review = await this.reviewsService.findOne(+id);
    
    // Check if user is the owner or has admin role
    const ability: AppAbility = (req as any).ability;
    if (!ability.can(Action.Delete, review)) {
      throw new ForbiddenException('You are not allowed to delete this review');
    }
    return this.reviewsService.remove(+id, userId);
  }
}
