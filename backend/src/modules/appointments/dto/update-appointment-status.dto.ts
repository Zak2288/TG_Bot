import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from '../../../shared/enums/appointment-status.enum';

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @IsString()
  @IsOptional()
  reason?: string;
} 