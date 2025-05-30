import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository, FindManyOptions, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { UserRole } from 'src/common/enums/user-role.enum';
import { FindAllReviewsDto, ReviewSortBy, SortOrder } from './dto/find-all-reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  // userId is passed from the controller after authentication
  async create(createReviewDto: CreateReviewDto, userId: number) {
     const review = this.reviewRepository.create({ ...createReviewDto, userId });
    return this.reviewRepository.save(review);
  }

  // Updated findAll to accept FindAllReviewsDto for advanced search
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

    // Filtering
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

    // Sorting
    if (sortBy && findOptions.order) {
      findOptions.order[sortBy] = sortOrder;
    } else if (findOptions.order) {
      // Default sort
      findOptions.order = { createdAt: 'DESC' };
    }

     // If there are no filter conditions, remove the empty where object
    const whereIsEmpty = findOptions.where === undefined ||
                         (Array.isArray(findOptions.where) && findOptions.where.length === 0) ||
                         (!Array.isArray(findOptions.where) && Object.keys(findOptions.where).length === 0);

    if (whereIsEmpty) {
        delete findOptions.where;
    }

    return this.reviewRepository.find(findOptions);
  }

  // Handle not found case in findOne
  async findOne(id: number): Promise<Review> { // Changed return type to non-nullable Review
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

  // Authorization check: only allow update by review owner or if ADMIN/STAFF (assuming role check in controller)
  async update(id: number, updateReviewDto: UpdateReviewDto, userId: number) { // userId added to signature
     const review = await this.reviewRepository.findOneBy({ id });
     if (!review) {
        throw new NotFoundException(`Review with ID ${id} not found`);
     }
      // Assuming controller guards handle ADMIN/STAFF roles.
      // This check ensures a regular user can only update their own review.
     if (review.userId !== userId) {
       throw new UnauthorizedException('You do not have permission to update this review');
     }
    await this.reviewRepository.update(id, updateReviewDto);
    return this.reviewRepository.findOneBy({ id }); // Return the updated review
  }

  // Authorization check: only allow removal by review owner or if ADMIN/STAFF (assuming role check in controller)
  async remove(id: number, userId: number): Promise<void> { // userId added to signature
     const review = await this.reviewRepository.findOneBy({ id });
      if (!review) {
        throw new NotFoundException(`Review with ID ${id} not found`);
     }
      // Assuming controller guards handle ADMIN/STAFF roles.
      // This check ensures a regular user can only delete their own review.
     if (review.userId !== userId) {
       throw new UnauthorizedException('You do not have permission to delete this review');
     }
    await this.reviewRepository.delete(id);
  }
}
