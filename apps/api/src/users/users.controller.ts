import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { DataSource, FindManyOptions, Like, In } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    const a: FindManyOptions<User> = {
      relations: ['posts', 'followers', 'following'],
    };
    return this.usersService.findAll(a);
  }
  @Post()
  async create(@Body() user: User) {
    return this.usersService.create(user);
  }
}
