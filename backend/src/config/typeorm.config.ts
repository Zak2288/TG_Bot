import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Appointment } from '../modules/appointments/appointments.entity';
import { Client } from '../modules/clients/clients.entity';
import { Service } from '../modules/services/services.entity';
import { Branch } from '../modules/branches/branches.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'business_management',
  entities: [
    Appointment,
    Client,
    Service,
    Branch
  ],
  synchronize: true, // В продакшене должно быть false
  logging: true,
}; 