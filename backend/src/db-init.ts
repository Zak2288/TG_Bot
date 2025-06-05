import { DataSource } from 'typeorm';
import { Client } from 'pg';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const logger = new Logger('DatabaseInit');

export async function initializeDatabase() {
  try {
    // Параметры базы данных
    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '5432', 10);
    const username = process.env.DB_USERNAME || 'postgres';
    const password = process.env.DB_PASSWORD || '1703';
    const database = process.env.DB_DATABASE || 'business_management';
    
    // Пробуем подключиться к postgres
    let pgConnected = false;
    const pgClient = new Client({
      host,
      port,
      user: username,
      password,
      database: 'postgres', // Подключаемся к postgres для управления базами данных
      connectionTimeoutMillis: 5000 // Таймаут 5 секунд
    });

    try {
      await pgClient.connect();
      pgConnected = true;
      logger.log('Подключились к PostgreSQL для управления базой данных');

      // Проверяем, существует ли база данных
      const dbExistsResult = await pgClient.query(`
        SELECT 1 FROM pg_database WHERE datname = $1
      `, [database]);
      
      if (dbExistsResult.rows.length === 0) {
        logger.error(`База данных ${database} не существует. Убедитесь, что база данных создана.`);
        return false;
      } else {
        logger.log(`База данных ${database} существует, продолжаем работу...`);
        
        // Закрываем активные соединения с базой данных, чтобы избежать блокировок
        logger.log('Закрываем активные соединения с базой данных...');
        try {
          await pgClient.query(`
            SELECT pg_terminate_backend(pid) 
            FROM pg_stat_activity 
            WHERE datname = $1 AND pid <> pg_backend_pid();
          `, [database]);
          logger.log('Активные соединения закрыты');
        } catch (err) {
          logger.warn(`Не удалось закрыть активные соединения: ${err.message}`);
        }
      }
      
    } catch (err) {
      logger.error(`Не удалось подключиться к PostgreSQL: ${err.message}`);
      logger.error('Убедитесь, что PostgreSQL запущен и доступен');
      return false;
    } finally {
      if (pgConnected) {
        await pgClient.end();
      }
    }

    logger.log('Инициализация базы данных завершена успешно');
    return true;
  } catch (error) {
    logger.error(`Критическая ошибка инициализации базы данных: ${error.message}`);
    return false;
  }
} 