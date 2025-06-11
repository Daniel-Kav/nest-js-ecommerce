import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiParam
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { jwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Request } from 'express';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { Product } from './entities/product.entity';
// import { ApiExtraModels, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(jwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiCreatedResponse({
    description: 'Product successfully created',
    type: Product
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Validation error',
    schema: {
      example: {
        statusCode: 400,
        message: ['name should not be empty', 'price must be a positive number'],
        error: 'Bad Request'
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT' })
  @ApiForbiddenResponse({ description: 'Forbidden - User does not have required role' })
  @ApiBody({ type: CreateProductDto })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all products with optional filtering and pagination' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter products by name or description'
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter products by category ID'
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price filter'
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price filter'
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Field to sort by (e.g., name, price, createdAt)'
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order (ASC or DESC)',
    enum: ['ASC', 'DESC']
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page'
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of items to skip'
  })
  @ApiOkResponse({
    description: 'List of products',
    type: [Product]
  })
  async findAll(@Query() queryDto: FindAllProductsDto) {
    return this.productsService.findAll(queryDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'integer' })
  @ApiOkResponse({
    description: 'Product found',
    type: Product
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'integer' })
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({
    description: 'Product updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Product updated successfully',
        data: {
          id: 1,
          name: 'Updated Product',
          description: 'Updated description',
          price: 99.99
          // ... other product fields
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT' })
  @ApiForbiddenResponse({ description: 'Forbidden - User does not have required role' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'integer' })
  @ApiOkResponse({
    description: 'Product deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Product deleted successfully'
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT' })
  @ApiForbiddenResponse({ description: 'Forbidden - User does not have required role' })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
