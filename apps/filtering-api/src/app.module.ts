import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilterModule } from './filtering/nest/filter.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Post, Comment } from './demo/entities';
import { CommentFilter, PostFilter, UserFilter } from './demo/filters';
import { DemoModule } from './demo/demo.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +(process.env.DATABASE_PORT ?? 5432),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Post, Comment],
      synchronize: false,
    }),
    FilterModule.forRoot([UserFilter, CommentFilter, PostFilter]),
    DemoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
