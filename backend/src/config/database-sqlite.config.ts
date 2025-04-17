import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const config: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: path.resolve(__dirname, '../../database.sqlite'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: process.env.NODE_ENV !== 'production',
};

export default config; 