import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { User } from 'src/users/entities/user.entity'; // Assuming you might need User entity for roles

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    // @InjectRepository(User) // Uncomment if fetching user roles in service
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

  async update(id: number, updateOrderDto: UpdateOrderDto, userId: number) {
    const order = await this.ordersRepository.findOneBy({ id });
    if (!order) {
       throw new NotFoundException(`Order with ID ${id} not found`);
    }

    this.ordersRepository.merge(order, updateOrderDto);
    return this.ordersRepository.save(order);
  }

  async remove(id: number, userId: number): Promise<void> {
    const order = await this.ordersRepository.findOne({ where: { id }, relations: ['orderItems'] });
    if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.orderItems && order.orderItems.length > 0) {
        await this.orderItemsRepository.remove(order.orderItems);
    }

    await this.ordersRepository.remove(order);
  }
}
