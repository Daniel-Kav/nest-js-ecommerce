import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository, FindManyOptions, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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
    // Use a cache key based on the query
    const cacheKey = 'products:' + JSON.stringify(queryDto);
    console.log('Using cacheKey:', cacheKey);

    let cachedProducts;
    try {
      cachedProducts = await this.cacheManager.get(cacheKey);
      if (cachedProducts) {
        console.log('Redis GET success: returning products from Redis for', cacheKey);
        return cachedProducts;
      } else {
        console.log('Redis GET: cache miss, querying DB for', cacheKey);
      }
    } catch (err) {
      console.error('Redis GET failed:', err);
    }
    const products = await this.productsRepository.find(findOptions);
    try {
      await this.cacheManager.set(cacheKey, products, 60);
      console.log('Redis SET success: products cached for', cacheKey);
    } catch (err) {
      console.error('Redis SET failed:', err);
    }
    return products;
  }

  async findOne(id: number): Promise<Product> {
    const cacheKey = `product:${id}`;
    let cachedProduct;
    try {
      cachedProduct = await this.cacheManager.get(cacheKey);
      if (cachedProduct) {
        console.log('Redis GET success: returning product from Redis for', cacheKey);
        return cachedProduct;
      } else {
        console.log('Redis GET: cache miss, querying DB for', cacheKey);
      }
    } catch (err) {
      console.error('Redis GET failed:', err);
    }
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    try {
      await this.cacheManager.set(cacheKey, product, 60);
      console.log('Redis SET success: product cached for', cacheKey);
    } catch (err) {
      console.error('Redis SET failed:', err);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<ApiResponse> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      return {
        success: false,
        message: `Product with ID ${id} not found`
      };
    }
    await this.productsRepository.update(id, updateProductDto);
    return {
      success: true,
      message: 'Product updated successfully'
    };
  }

  async remove(id: number): Promise<ApiResponse> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      return {
        success: false,
        message: `Product with ID ${id} not found`
      };
    }
    
    await this.productsRepository.delete(id);
    return {
      success: true,
      message: 'Product deleted successfully'
    };
  }
}
