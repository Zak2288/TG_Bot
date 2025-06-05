import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TelegramService } from '../telegram/telegram.service';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramService: TelegramService
  ) {}

  @Get()
  findAll(@Query() query: any) {
    return this.appointmentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.appointmentsService.update(+id, updateAppointmentDto);
    
    // Если изменен статус, отправляем уведомление через Telegram
    if (updateAppointmentDto.status) {
      await this.telegramService.updateAppointmentStatus(
        +id, 
        updateAppointmentDto.status, 
        updateAppointmentDto.cancellationReason
      );
    }
    
    return appointment;
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string, 
    @Body() updateStatusDto: UpdateAppointmentStatusDto
  ) {
    const appointment = await this.appointmentsService.update(+id, {
      status: updateStatusDto.status,
      cancellationReason: updateStatusDto.reason
    });
    
    // Отправляем уведомление через Telegram
    await this.telegramService.updateAppointmentStatus(
      +id, 
      updateStatusDto.status, 
      updateStatusDto.reason
    );
    
    return appointment;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(+id);
  }
} 