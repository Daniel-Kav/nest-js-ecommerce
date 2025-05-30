import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity'; // Assuming Payment entity has a relation to Order
import { UserRole } from 'src/common/enums/user-role.enum'; // Assuming UserRole enum might be needed

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    // @InjectRepository(Order) // Uncomment if fetching Order separately
    // private orderRepository: Repository<Order>,
  ) {}
  // Create a payment
  // userId is passed from the controller after authentication
  async create(createPaymentDto: CreatePaymentDto, userId: number) {
     // Optional: Add logic here if linking payment to user or checking user context during creation
     // For now, assuming payment is linked via order which is linked to user
    return this.paymentsRepository.save(createPaymentDto);
  }

  // findAll is likely for admin/staff, authorization handled by controller guard
  findAll() {
    return this.paymentsRepository.find();
  }

  // Authorization check: only allow access to payment if user owns the related order or is ADMIN/STAFF
  // Handle not found case in findOne
  async findOne(id: number, userId: number): Promise<Payment> { // Changed return type to non-nullable Payment
    const payment = await this.paymentsRepository.findOne({ where: { id }, relations: ['order', 'order.user'] }); // Load related order and user
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    
    // Check if the authenticated user is the owner of the associated order
    // Or if the user has ADMIN/STAFF roles (assuming you fetch user with roles elsewhere or check in controller)
    // For this service method, we'll focus on ownership check via the order.
     if (!payment.order || payment.order.userId !== userId) {
       throw new UnauthorizedException('You do not have permission to access this payment');
     }

    return payment;
  }

   // update and remove are restricted to ADMIN/STAFF by the controller guard
  async update(id: number, updatePaymentDto: UpdatePaymentDto, userId: number) { // userId added to signature
     const payment = await this.paymentsRepository.findOne({ where: { id }, relations: ['order'] });
     if (!payment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
     }
     // Authorization check (optional here, as controller guard restricts roles):
     // if (!payment.order || payment.order.userId !== userId) { ... check admin/staff role ... }

    await this.paymentsRepository.update(id, updatePaymentDto) ;
     return this.paymentsRepository.findOne({ where: { id } }); // Return the updated payment
  }

   // remove is restricted to ADMIN/STAFF by the controller guard
  async remove(id: number, userId: number): Promise<void> { // userId added to signature
     const payment = await this.paymentsRepository.findOne({ where: { id }, relations: ['order'] });
      if (!payment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
     }
      // Authorization check (optional here, as controller guard restricts roles):
     // if (!payment.order || payment.order.userId !== userId) { ... check admin/staff role ... }

    await this.paymentsRepository.delete(id);
  }
}
