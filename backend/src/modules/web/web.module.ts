import { Module } from '@nestjs/common';
import { WebController } from './web.controller';
import { ServicesModule } from '../services/services.module';
import { TelegramModule } from '../telegram/telegram.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ServicesModule, TelegramModule, AuthModule],
  controllers: [WebController],
})
export class WebModule {} 