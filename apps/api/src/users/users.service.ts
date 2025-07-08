import { Injectable } from '@nestjs/common';
import { User } from './users.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findById(id: number): Promise<User> {
    return this.repo.findOneBy({ id });
  }

  async findAll(query: FindManyOptions<User>): Promise<User[]> {
    return this.repo.find(query);
  }

  async create(userAttrs: User): Promise<User> {
    const user = this.repo.create(userAttrs);
    return this.repo.save(user);
  }
}
