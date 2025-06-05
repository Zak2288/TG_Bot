import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { TelegramModule } from '../telegram/telegram.module';
import { AdminGuard } from './admin.guard';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TelegramModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, AdminGuard],
  controllers: [AuthController],
  exports: [AuthService, AdminGuard],
})
export class AuthModule {} 