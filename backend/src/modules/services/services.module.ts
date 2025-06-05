import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './services.entity';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service]),
    forwardRef(() => TelegramModule)
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {} 