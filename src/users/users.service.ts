import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { FindAllUsersDto, UserSortBy, SortOrder } from './dto/find-all-users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(queryDto: FindAllUsersDto): Promise<User[]> {
    const { search, role, sortBy, sortOrder, limit, offset } = queryDto;
    const findOptions: FindManyOptions<User> = {
      where: {},
      order: {},
      take: limit,
      skip: offset,
    };
    if (search) {
      findOptions.where = [
        { email: Like(`%${search}%`) },
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
      ];
    }
    if (role) {
      if (Array.isArray(findOptions.where)) {
        findOptions.where = findOptions.where.map(condition => ({ ...condition, role: role }));
      } else {
        findOptions.where = { ...findOptions.where, role: role };
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
    return this.userRepository.find(findOptions);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<void> {
    await this.userRepository.update(id, updateUserDto);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
