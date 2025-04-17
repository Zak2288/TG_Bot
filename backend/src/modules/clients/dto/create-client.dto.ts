import { IsString, IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ description: 'Имя клиента' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Номер телефона клиента' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Email клиента', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Комментарий', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Источник', required: false })
  @IsString()
  @IsOptional()
  source?: string;
} 