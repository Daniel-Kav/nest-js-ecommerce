import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository, FindManyOptions } from 'typeorm';
import { FindAllCartsDto, CartSortBy, SortOrder } from './dto/find-all-carts.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}
  
  // userId is passed from the controller after authentication
  async create(createCartDto: CreateCartDto, userId: number) {
    const cart = this.cartRepository.create({ ...createCartDto, userId });
    return this.cartRepository.save(cart);
  }

  // Updated findAll to accept FindAllCartsDto for advanced search (ADMIN/STAFF only)
  async findAll(queryDto: FindAllCartsDto): Promise<Cart[]> {
    const { userId, sortBy, sortOrder, limit, offset } = queryDto;

    const findOptions: FindManyOptions<Cart> = {
      where: {},
      order: {},
      take: limit,
      skip: offset,
    };

    // Filtering by userId
    if (userId) {
      findOptions.where = { userId: userId };
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

    return this.cartRepository.find(findOptions);
  }

  // Authorization check: only allow access to own cart or if ADMIN/STAFF (assuming role check in controller for admin)
  // Handle not found case in findOne
  async findOne(id: number, userId: number): Promise<Cart> { // Changed return type to non-nullable Cart
    const cart = await this.cartRepository.findOneBy({ id });
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }
    // Assuming controller guards handle ADMIN/STAFF roles for 'admin' endpoints like findAll
    // For findOne by ID, we assume a regular user is trying to access THEIR cart.
    // A more robust check would involve fetching user roles here too if findOne is also used by admins
    if (cart.userId !== userId) {
      // If not the owner, check if the user is admin/staff (optional, depending on where you put this check)
      // For now, we'll rely on controller roles guard for admin routes, and this for user's own cart.
      throw new UnauthorizedException('You do not have permission to access this cart');
    }
    return cart;
  }

  // Authorization check: only allow update to own cart or if ADMIN/STAFF (assuming role check in controller for admin)
  async update(id: number, updateCartDto: UpdateCartDto, userId: number) {
    const cart = await this.cartRepository.findOneBy({ id });
     if (!cart) {
       throw new NotFoundException(`Cart with ID ${id} not found`);
    }
     if (cart.userId !== userId) {
       throw new UnauthorizedException('You do not have permission to update this cart');
     }
    await this.cartRepository.update(id, updateCartDto);
    return this.cartRepository.findOneBy({ id }); // Return the updated cart
  }

  // Authorization check: only allow removal of own cart or if ADMIN/STAFF (assuming role check in controller for admin)
  async remove(id: number, userId: number): Promise<void> {
     const cart = await this.cartRepository.findOneBy({ id });
     if (!cart) {
       throw new NotFoundException(`Cart with ID ${id} not found`);
     }
      if (cart.userId !== userId) {
       throw new UnauthorizedException('You do not have permission to delete this cart');
     }
    await this.cartRepository.delete(id);
  }
}
