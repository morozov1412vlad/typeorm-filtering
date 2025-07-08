import { Controller, Get, Post, Body, Injectable } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostEntity } from './posts.entity';
import { User } from 'src/users/users.entity';
import { DataSource, FindManyOptions } from 'typeorm';
import { IsNumber, IsString } from 'class-validator';
import {
  CompoundFilter,
  ConditionalOperator,
} from 'src/filtering/types.filter';
import { PrimitiveFilterOperator } from 'src/filtering/operator.types';
import { TargetFilterNode } from 'src/filtering/filter_node';
import { InjectFilter } from 'src/filtering/nest/InjectFilter';
import { UserFilter } from 'src/users/users.filter';
import { FilterService } from 'src/filtering/nest/filter.service';

export class PostDTO {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsNumber()
  user_id: number;
}

const testFilter1: CompoundFilter = {
  attribute: 'posts',
  filters: {
    conditional_operator: ConditionalOperator.OR,
    conditions: [
      {
        attribute: 'posts.title',
        operator: PrimitiveFilterOperator.CONTAINS,
        value: '3',
      },
      {
        attribute: 'posts.title',
        operator: PrimitiveFilterOperator.ENDS_WITH_CASE_SENSITIVE,
        value: 'ost 2',
      },
    ],
  },
};

const testFilter2: CompoundFilter = {
  attribute: 'posts',
  filters: {
    conditional_operator: ConditionalOperator.AND,
    conditions: [
      {
        conditional_operator: ConditionalOperator.OR,
        conditions: [
          {
            attribute: 'posts.title',
            operator: PrimitiveFilterOperator.CONTAINS,
            value: '3',
          },
          {
            attribute: 'posts.title',
            operator: PrimitiveFilterOperator.ENDS_WITH_CASE_SENSITIVE,
            value: 'ost 2',
          },
        ],
      },
      {
        attribute: 'posts.user',
        filters: {
          conditional_operator: ConditionalOperator.AND,
          conditions: [
            {
              attribute: 'posts.user.username',
              operator: PrimitiveFilterOperator.IS,
              value: 'test',
            },
          ],
        },
      },
    ],
  },
};

const testFilter3: CompoundFilter = {
  attribute: 'users',
  filters: {
    conditional_operator: ConditionalOperator.AND,
    conditions: [
      {
        attribute: 'users.username',
        operator: PrimitiveFilterOperator.CONTAINS,
        value: 'tes',
      },
    ],
  },
};

const testFilter4: CompoundFilter = {
  attribute: 'users',
  filters: {
    conditional_operator: ConditionalOperator.AND,
    conditions: [
      {
        attribute: 'users.username',
        operator: PrimitiveFilterOperator.CONTAINS,
        value: 'tes',
      },
      {
        attribute: 'users.posts',
        filters: {
          conditional_operator: ConditionalOperator.AND,
          conditions: [
            {
              attribute: 'users.posts.title',
              operator: PrimitiveFilterOperator.CONTAINS,
              value: '3',
            },
          ],
        },
      },
      {
        attribute: 'users.posts',
        filters: {
          conditional_operator: ConditionalOperator.AND,
          conditions: [
            {
              attribute: 'users.posts.title',
              operator: PrimitiveFilterOperator.ENDS_WITH_CASE_SENSITIVE,
              value: 'ost 2',
            },
          ],
        },
      },
    ],
  },
};

const testFilter5: CompoundFilter = {
  attribute: 'users',
  filters: {
    conditional_operator: ConditionalOperator.AND,
    conditions: [
      
    ],
  },
};

const testFilter6: CompoundFilter = {
  attribute: 'users',
  filters: {
    conditional_operator: ConditionalOperator.AND,
    conditions: [
      {
        attribute: 'users.followers',
        filters: {
          conditional_operator: ConditionalOperator.AND,
          conditions: [
            {
              attribute: 'users.followers.id',
              operator: PrimitiveFilterOperator.IS,
              value: 4,
            },
          ],
        },
      },
      {
        attribute: 'users.followers',
        filters: {
          conditional_operator: ConditionalOperator.AND,
          conditions: [
            {
              attribute: 'users.followers.id',
              operator: PrimitiveFilterOperator.IS,
              value: 2,
            },
          ],
        },
      },
    ],
  },
};

@Injectable()
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
    @InjectFilter(UserFilter) private readonly userFilterService: FilterService<User>,
  ) {}

  @Get()
  async findAll(): Promise<PostEntity[]> {
    return this.postsService.findAll();
  }

  @Post()
  async create(@Body() post: PostDTO): Promise<PostEntity> {
    return this.postsService.create(post);
  }

  @Get('test')
  async test(): Promise<any> {
    // const queryBuilder = this.dataSource.createQueryBuilder(User, 'users');
    // const filterNode = new TargetFilterNode(
    //   'users',
    //   testFilter6,
    //   this.dataSource,
    //   queryBuilder,
    // );
    // const queryBuilder = this.dataSource.createQueryBuilder(
    //   PostEntity,
    //   'posts',
    // );
    // const filterNode = new TargetFilterNode(
    //   'posts',
    //   testFilter2,
    //   this.dataSource,
    //   queryBuilder,
    // );
    // const result = filterNode.resolve();
    // console.log(result.qb.getQuery());
    // console.log(result.qb.getParameters());
    // return result.qb.getMany();
    // this.userFilterService.test();
    const qb = this.userFilterService.getQueryBuilder(testFilter5);
    console.log(qb.getQuery());
    console.log(qb.getParameters());
    return qb.getMany();
  }
}
