import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ClientsModule } from './modules/clients/clients.module';
import { BranchesModule } from './modules/branches/branches.module';
import { ServicesModule } from './modules/services/services.module';
import { SalesModule } from './modules/sales/sales.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { WebModule } from './modules/web/web.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      ttl: 30000, // 30 секунд
      max: 100, // максимальное количество элементов в кэше
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: ['error', 'warn'],
      extra: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
      cache: {
        duration: 30000,
      }
    }),
    UsersModule,
    AuthModule,
    AppointmentsModule,
    ClientsModule,
    BranchesModule,
    ServicesModule,
    SalesModule,
    NotificationsModule,
    IntegrationsModule,
    TelegramModule,
    WebModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
