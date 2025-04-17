import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import sqliteConfig from './database-sqlite.config';
import postgresConfig from './database-postgres.config';

dotenv.config();

// По умолчанию используем SQLite, если в .env не указан DB_TYPE=postgres
const usePostgres = process.env.DB_TYPE === 'postgres';

const config: TypeOrmModuleOptions = usePostgres ? postgresConfig : sqliteConfig;

export default config; 