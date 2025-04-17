import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../appointments/appointments.entity';
import { Client } from '../clients/clients.entity';
import { Service } from '../services/services.entity';
import { Branch } from '../branches/branches.entity';
import { AppointmentsModule } from '../appointments/appointments.module';
import { ClientsModule } from '../clients/clients.module';
import { BranchesModule } from '../branches/branches.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Client, Service, Branch]),
    AppointmentsModule,
    ClientsModule,
    BranchesModule,
    ServicesModule,
  ],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {} 