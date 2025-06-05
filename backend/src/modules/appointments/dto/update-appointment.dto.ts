import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsString()
  @IsOptional()
  cancellationReason?: string;
} 