import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { User } from './modules/users/users.entity';
import { Branch } from './modules/branches/branches.entity';
import { Appointment } from './modules/appointments/appointments.entity';
import { Sale } from './modules/sales/sales.entity';
import { Service } from './modules/services/services.entity';
import { Client } from './modules/clients/clients.entity';
import { Role } from './shared/enums/role.enum';

dotenv.config();

async function bootstrap() {
  const configService = new ConfigService();
  
  // Создаем DataSource для подключения к базе данных
  const AppDataSource = new DataSource({
    type: 'sqlite',
    database: configService.get('DATABASE_NAME') || 'dev.db',
    entities: [User, Branch, Appointment, Sale, Service, Client], 
    synchronize: true,
  });
  
  // Инициализируем соединение с базой данных
  await AppDataSource.initialize()
    .then(() => {
      console.log('Data Source has been initialized!');
    })
    .catch((err) => {
      console.error('Error during Data Source initialization', err);
      process.exit(1);
    });

  const userRepository = AppDataSource.getRepository(User);
  
  // Проверяем, существует ли пользователь с указанным email
  const existingUser = await userRepository.findOne({ 
    where: { email: '89.zakl@mail.ru' } 
  });
  
  if (existingUser) {
    console.log('Администратор с email 89.zakl@mail.ru уже существует');
  } else {
    // Хешируем пароль перед сохранением
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    
    // Создаем нового администратора
    const newAdmin = new User();
    newAdmin.email = '89.zakl@mail.ru';
    newAdmin.password = hashedPassword;
    newAdmin.name = 'Администратор';
    newAdmin.role = Role.ADMIN;
    
    await userRepository.save(newAdmin);
    console.log('Администратор успешно создан:');
    console.log('Email: 89.zakl@mail.ru');
    console.log('Пароль: admin123');
  }
  
  // Закрываем соединение с базой данных
  await AppDataSource.destroy();
  process.exit(0);
}

bootstrap(); 