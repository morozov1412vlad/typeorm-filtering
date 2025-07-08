import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LinksModule } from './links/links.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { User } from './users/users.entity';
import { PostsModule } from './posts/posts.module';
import { Post } from './posts/posts.entity';
import { FilterModule } from './filtering/nest/filter.module';
import { UserFilter } from './users/users.filter';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'morozov',
      password: 'test',
      database: 'typeorm_filtering',
      entities: [User, Post],
      synchronize: false,
    }),
    FilterModule.forRoot([UserFilter]),
    LinksModule,
    UsersModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
