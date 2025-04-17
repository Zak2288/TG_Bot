import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from '../../../shared/enums/appointment-status.enum';
import { Source } from '../../../shared/enums/source.enum';

export class CreateAppointmentDto {
  @IsDateString()
  startTime: Date;

  @IsDateString()
  endTime: Date;

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @IsInt()
  clientId: number;

  @IsInt()
  serviceId: number;

  @IsInt()
  branchId: number;

  @IsEnum(Source)
  @IsOptional()
  source?: Source;

  @IsString()
  @IsOptional()
  sourceId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
} 