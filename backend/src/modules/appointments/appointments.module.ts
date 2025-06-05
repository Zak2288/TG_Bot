import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './appointments.entity';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment]),
    forwardRef(() => TelegramModule)
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {} 