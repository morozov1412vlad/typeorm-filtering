import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Post } from './posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PostDTO } from './posts.controller';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}

  async findAll(): Promise<Post[]> {
    return this.postRepository.find();
  }

  async create(post: PostDTO): Promise<Post> {
    return this.postRepository.save({
      title: post.title,
      content: post.content,
      user: {
        id: post.user_id,
      },
    });
  }
}
