import { Controller, Post, Body, Injectable } from '@nestjs/common';
import { User, Comment, Post as PostEntity } from './entities';
import { UserFilter, CommentFilter, PostFilter } from './filters';
import { FilterService, InjectFilter } from 'src/filtering/nest';
import { type CompoundFilter } from 'src/filtering/filter.types';

@Injectable()
@Controller()
export class PostsController {
  constructor(
    @InjectFilter(UserFilter) private readonly userFilterService: FilterService<User>,
    @InjectFilter(CommentFilter) private readonly commentFilterService: FilterService<Comment>,
    @InjectFilter(PostFilter) private readonly postFilterService: FilterService<PostEntity>,
  ) {}

  @Post('users/filter')
  async test(@Body() filter: CompoundFilter) {
    const qb = this.userFilterService.getQueryBuilder(filter);
    const result = await qb.getRawMany();
    return result.map((row) => {
      return {
        id: row.users_id,
        username: row.users_username,
      };
    });
  }

  @Post('posts/filter')
  async testPosts(@Body() filter: CompoundFilter) {
    const qb = this.postFilterService.getQueryBuilder(filter);
    const result = await qb.getRawMany();
    return result.map((row) => {
      return {
        id: row.posts_id,
        title: row.posts_title,
      };
    });
  }

  @Post('comments/filter')
  async testComments(@Body() filter: CompoundFilter) {
    const qb = this.commentFilterService.getQueryBuilder(filter);
    const result = await qb.getRawMany();
    return result.map((row) => {
      return {
        id: row.comments_id,
        content: row.comments_content,
      };
    });
  }
}
