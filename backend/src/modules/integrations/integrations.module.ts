import { Module } from '@nestjs/common';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  controllers: [],
  providers: [],
  exports: [TelegramModule]
})
export class IntegrationsModule {} 