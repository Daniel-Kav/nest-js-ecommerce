import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { User } from 'src/users/entities/user.entity'; // Assuming you might need User entity for roles
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    // @InjectRepository(User) 
    // private userRepository: Repository<User>,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number): Promise<Order> {
    const order = this.ordersRepository.create({ ...createOrderDto, userId });
    
    order.orderNumber = faker.string.alphanumeric(10).toUpperCase();

    return this.ordersRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find();
  }

  async findOne(id: number, userId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id }, relations: ['user'] });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.userId !== userId) {
       throw new UnauthorizedException('You do not have permission to access this order');
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto, userId: number): Promise<ApiResponse> {
    const order = await this.ordersRepository.findOneBy({ id });
    if (!order) {
      return {
        success: false,
        message: `Order with ID ${id} not found`
      };
    }
    if (order.userId !== userId) {
      return {
        success: false,
        message: 'You do not have permission to update this order'
      };
    }
    this.ordersRepository.merge(order, updateOrderDto);
    await this.ordersRepository.save(order);
    return {
      success: true,
      message: 'Order updated successfully'
    };
  }

  async remove(id: number, userId: number): Promise<ApiResponse> {
    const order = await this.ordersRepository.findOne({ where: { id }, relations: ['orderItems'] });
    if (!order) {
      return {
        success: false,
        message: `Order with ID ${id} not found`
      };
    }
    if (order.userId !== userId) {
      return {
        success: false,
        message: 'You do not have permission to delete this order'
      };
    }
    if (order.orderItems && order.orderItems.length > 0) {
      await this.orderItemsRepository.remove(order.orderItems);
    }
    await this.ordersRepository.remove(order);
    return {
      success: true,
      message: 'Order deleted successfully'
    };
  }
}
