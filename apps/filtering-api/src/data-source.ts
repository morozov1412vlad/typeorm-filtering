import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User, Post, Comment } from './demo/entities';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, Post, Comment],
  synchronize: false,
  migrations: [__dirname + '/migrations/*.ts'],
});

export default AppDataSource;
