import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository, FindManyOptions, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.productsRepository.save(createProductDto);
  }

  async findAll(queryDto: FindAllProductsDto): Promise<Product[]> {
    const { search, categoryId, minPrice, maxPrice, sortBy, sortOrder, limit, offset } = queryDto;
    const findOptions: FindManyOptions<Product> = {
      where: {},
      order: {},
      take: limit,
      skip: offset,
    };
    if (search) {
      findOptions.where = [
        { name: Like(`%${search}%`) },
        { description: Like(`%${search}%`) },
      ];
    }
    if (categoryId) {
      if (Array.isArray(findOptions.where)) {
        findOptions.where = findOptions.where.map(condition => ({ ...condition, categoryId: categoryId }));
      } else {
        findOptions.where = { ...findOptions.where, categoryId: categoryId };
      }
    }
    if (minPrice !== undefined && maxPrice !== undefined) {
      if (Array.isArray(findOptions.where)) {
        findOptions.where = findOptions.where.map(condition => ({ ...condition, price: Between(minPrice, maxPrice) }));
      } else {
        findOptions.where = { ...findOptions.where, price: Between(minPrice, maxPrice) };
      }
    } else if (minPrice !== undefined) {
      if (Array.isArray(findOptions.where)) {
        findOptions.where = findOptions.where.map(condition => ({ ...condition, price: MoreThanOrEqual(minPrice) }));
      } else {
        findOptions.where = { ...findOptions.where, price: MoreThanOrEqual(minPrice) };
      }
    } else if (maxPrice !== undefined) {
      if (Array.isArray(findOptions.where)) {
        findOptions.where = findOptions.where.map(condition => ({ ...condition, price: LessThanOrEqual(maxPrice) }));
      } else {
        findOptions.where = { ...findOptions.where, price: LessThanOrEqual(maxPrice) };
      }
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
    return this.productsRepository.find(findOptions);
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<void> {
    await this.productsRepository.update(id, updateProductDto);
  }

  async remove(id: number): Promise<void> {
    await this.productsRepository.delete(id);
  }
}
