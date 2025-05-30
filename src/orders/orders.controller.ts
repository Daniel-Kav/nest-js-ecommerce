import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { jwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Request } from 'express';

@Controller('orders')
@UseGuards(jwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.ordersService.create(createOrderDto, userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    // Service method should verify ownership or admin role
    return this.ordersService.findOne(+id, userId);
  }

  @Patch(':id')
   @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto, @Req() req: Request) {
     const userId = (req.user as any).id;
    // Service method should verify ownership or admin role
    return this.ordersService.update(+id, updateOrderDto, userId);
  }

  @Delete(':id')
   @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  remove(@Param('id') id: string, @Req() req: Request) {
     const userId = (req.user as any).id;
    // Service method should verify ownership or admin role
    return this.ordersService.remove(+id, userId);
  }
}
