import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { FindAllCategoriesDto, CategorySortBy, SortOrder } from './dto/find-all-categories.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ){}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesRepository.create(createCategoryDto);
  }

  async findAll(queryDto: FindAllCategoriesDto): Promise<Category[]> {
    const { search, sortBy, sortOrder, limit, offset } = queryDto;
    const findOptions: FindManyOptions<Category> = {
      where: {},
      order: {},
      take: limit,
      skip: offset,
    };
    if (search) {
      findOptions.where = [
        { name: Like(`%${search}%`) },
      ];
    }
    if (sortBy) {
      if (!findOptions.order) findOptions.order = {};
      findOptions.order[sortBy] = sortOrder;
    } else {
      if (!findOptions.order) findOptions.order = {};
      findOptions.order = { createdAt: 'DESC' };
    }
    const whereIsEmpty = findOptions.where === undefined ||
                         (Array.isArray(findOptions.where) && findOptions.where.length === 0) ||
                         (!Array.isArray(findOptions.where) && typeof findOptions.where === 'object' && Object.keys(findOptions.where).length === 0);
    if (whereIsEmpty) {
        delete findOptions.where;
    }
    return this.categoriesRepository.find(findOptions);
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({id});
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<void> {
    await this.categoriesRepository.update(id, updateCategoryDto);
  }

  async remove(id: number): Promise<void> {
    await this.categoriesRepository.delete(id);
  }
}
