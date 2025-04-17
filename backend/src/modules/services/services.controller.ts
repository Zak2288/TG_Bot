import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from './services.entity';
import { AdminGuard } from '../auth/admin.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все услуги' })
  async getAllServices(): Promise<Service[]> {
    return this.servicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить услугу по ID' })
  async getService(@Param('id') id: number): Promise<Service> {
    return this.servicesService.findOne(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новую услугу' })
  async createService(@Body() service: Partial<Service>): Promise<Service> {
    return this.servicesService.create(service);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить данные услуги' })
  async updateService(
    @Param('id') id: number,
    @Body() service: Partial<Service>,
  ): Promise<Service> {
    return this.servicesService.update(id, service);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить услугу' })
  async deleteService(@Param('id') id: number): Promise<void> {
    return this.servicesService.remove(id);
  }

  @Get('categories/all')
  async getAllCategories(): Promise<string[]> {
    return this.servicesService.getAllCategories();
  }
} 