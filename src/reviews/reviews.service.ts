import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository, FindManyOptions, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { UserRole } from 'src/common/enums/user-role.enum';
import { FindAllReviewsDto, ReviewSortBy, SortOrder } from './dto/find-all-reviews.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async create(createReviewDto: CreateReviewDto, userId: number): Promise<Review> {
    const review = this.reviewRepository.create({ ...createReviewDto, userId });
    return this.reviewRepository.save(review);
  }

  async findAll(queryDto: FindAllReviewsDto): Promise<Review[]> {
    const { search, productId, userId, rating, minRating, maxRating, sortBy, sortOrder, limit, offset } = queryDto;
    const findOptions: FindManyOptions<Review> = {
      where: {},
      relations: ['user', 'product'],
      select: {
        product: {
          id: true,
          name: true,
          price: true
        },
        user: {
          id: true,
          email: true
        }
      },
      order: {},
      take: limit,
      skip: offset,
    };
    if (search) {
      findOptions.where = { comment: Like(`%${search}%`) };
    }
    if (productId) {
      findOptions.where = { ...findOptions.where, product: { id: productId } };
    }
    if (userId) {
      findOptions.where = { ...findOptions.where, user: { id: userId } };
    }
    if (rating !== undefined) {
      findOptions.where = { ...findOptions.where, rating: rating };
    }
    if (minRating !== undefined && maxRating !== undefined) {
      findOptions.where = { ...findOptions.where, rating: Between(minRating, maxRating) };
    } else if (minRating !== undefined) {
      findOptions.where = { ...findOptions.where, rating: MoreThanOrEqual(minRating) };
    } else if (maxRating !== undefined) {
      findOptions.where = { ...findOptions.where, rating: LessThanOrEqual(maxRating) };
    }
    if (sortBy && findOptions.order) {
      findOptions.order[sortBy] = sortOrder;
    } else if (findOptions.order) {
      findOptions.order = { createdAt: 'DESC' };
    }
    const whereIsEmpty = findOptions.where === undefined ||
                         (Array.isArray(findOptions.where) && findOptions.where.length === 0) ||
                         (!Array.isArray(findOptions.where) && Object.keys(findOptions.where).length === 0);
    if (whereIsEmpty) {
        delete findOptions.where;
    }
    return this.reviewRepository.find(findOptions);
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: {
        user: true,
        product: true,
      },
      select: {
        user: {
          id: true,
          email: true,
        },
        product: {
          id: true,
          name: true,
          price: true,
        }
      }
    });
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return review;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto, userId: number): Promise<ApiResponse> {
    const review = await this.reviewRepository.findOneBy({ id });
    if (!review) {
      return {
        success: false,
        message: `Review with ID ${id} not found`
      };
    }
    if (review.userId !== userId) {
      return {
        success: false,
        message: 'You do not have permission to update this review'
      };
    }
    await this.reviewRepository.update(id, updateReviewDto);
    return {
      success: true,
      message: 'Review updated successfully'
    };
  }

  async remove(id: number, userId: number): Promise<ApiResponse> {
    const review = await this.reviewRepository.findOneBy({ id });
    if (!review) {
      return {
        success: false,
        message: `Review with ID ${id} not found`
      };
    }
    if (review.userId !== userId) {
      return {
        success: false,
        message: 'You do not have permission to delete this review'
      };
    }
    await this.reviewRepository.delete(id);
    return {
      success: true,
      message: 'Review deleted successfully'
    };
  }
}
