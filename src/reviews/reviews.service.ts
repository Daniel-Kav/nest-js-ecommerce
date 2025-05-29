import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}
  create(createReviewDto: CreateReviewDto) {
    return this.reviewRepository.save(createReviewDto);
  }

  findAll() {
    return this.reviewRepository.find({
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
      }
    });
  }

  // async findOne(id: number) {
  //   const review = await this.reviewRepository.findOne({
  //     where: { id },
  //     relations: ['user'],
  //   });
  //   if (!review) return null;
  //   // Only include the user's email
  //   const { user, ...rest } = review as any;
  //   return {
  //     ...rest,
  //     user: user ? { email: user.email } : null,
  //   };
  // }

async findOne(id: number) {
  return this.reviewRepository.findOne({
    where: { id },
    relations: {
      user: true,
      product: true,
      // Add more relations as needed
      // order: true,
      // category: true,
    },
    select: {
      user: {
        id: true,
        email: true,
        // Add more user fields as needed
      },
      product: {
        id: true,
        name: true,
        price: true,
        // Add more product fields as needed
      }
    }
  });
}

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return this.reviewRepository.update(id, updateReviewDto);
  }

  remove(id: number) {
    return this.reviewRepository.delete(id);
  }
}
