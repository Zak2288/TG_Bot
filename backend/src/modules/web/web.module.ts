import { Module } from '@nestjs/common';
import { WebController } from './web.controller';
import { ServicesModule } from '../services/services.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [ServicesModule, TelegramModule],
  controllers: [WebController],
})
export class WebModule {} 