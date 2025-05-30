import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpStatus, UseGuards, Req, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { jwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Request } from 'express';
import { FindAllReviewsDto } from './dto/find-all-reviews.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(jwtAuthGuard)
  create(@Body() createReviewDto: CreateReviewDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.reviewsService.create(createReviewDto, userId);
  }

  @Get()
  @UseGuards(jwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query() queryDto: FindAllReviewsDto) {
    return this.reviewsService.findAll(queryDto);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: number,
  ) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(jwtAuthGuard)
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.reviewsService.update(+id, updateReviewDto, userId);
  }

  @Delete(':id')
  @UseGuards(jwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.reviewsService.remove(+id, userId);
  }
}
