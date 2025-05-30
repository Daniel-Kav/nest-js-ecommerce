import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { jwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Request } from 'express';
import { FindAllCartsDto } from './dto/find-all-carts.dto';

@Controller('cart')
@UseGuards(jwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  create(@Body() createCartDto: CreateCartDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.cartService.create(createCartDto, userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findAll(@Query() queryDto: FindAllCartsDto) {
    return this.cartService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
     const userId = (req.user as any).id;
    // Service method should verify ownership or admin role
    return this.cartService.findOne(+id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto, @Req() req: Request) {
     const userId = (req.user as any).id;
    // Service method should verify ownership or admin role
    return this.cartService.update(+id, updateCartDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
     const userId = (req.user as any).id;
    // Service method should verify ownership or admin role
    return this.cartService.remove(+id, userId);
  }
}
