import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Post, Comment } from './entities';
import { PostsController } from './demo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post, Comment])],
  providers: [],
  controllers: [PostsController],
  exports: [],
})
export class DemoModule {}
