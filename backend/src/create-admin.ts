import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './modules/users/users.entity';
import { Repository } from 'typeorm';
import { Role } from './shared/enums/role.enum';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('CreateAdmin');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    
    // Проверяем, существует ли пользователь с указанным email
    const existingUser = await userRepository.findOne({ 
      where: { email: '89.zakl@mail.ru' } 
    });

    if (!existingUser) {
      logger.log('Создаем пользователя-администратора...');
      
      // Хешируем пароль
      const hashedPassword = await bcrypt.hash('cvet48lip', 10);
      
      // Создаем пользователя
      const admin = userRepository.create({
        email: '89.zakl@mail.ru',
        password: hashedPassword,
        name: 'Администратор',
        role: Role.ADMIN
      });

      await userRepository.save(admin);
      logger.log('Пользователь-администратор успешно создан!');
      logger.log('Email: 89.zakl@mail.ru');
      logger.log('Пароль: cvet48lip');
    } else {
      logger.log('Пользователь с email 89.zakl@mail.ru уже существует');
    }
  } catch (error) {
    logger.error(`Ошибка при создании пользователя: ${error.message}`);
  } finally {
    await app.close();
  }
}

bootstrap(); 