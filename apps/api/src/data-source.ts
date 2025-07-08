import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './users/users.entity';
import { Post } from './posts/posts.entity';
const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'morozov',
  password: 'test',
  database: 'typeorm_filtering',
  entities: [User, Post],
  synchronize: false,
  migrations: [__dirname + '/migrations/*.ts'],
});

export default AppDataSource;
