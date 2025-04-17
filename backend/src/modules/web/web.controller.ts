import { Controller, Get, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { ServicesService } from '../services/services.service';
import { AdminGuard } from '../auth/admin.guard';
import { Service } from '../services/services.entity';
import { TelegramService } from '../telegram/telegram.service';

@Controller('web')
export class WebController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly telegramService: TelegramService,
  ) {}

  @Get('price')
  async getPriceList() {
    const services = await this.servicesService.findAll();
    return {
      services,
      categories: await this.servicesService.getAllCategories(),
    };
  }

  @Get('check-admin/:userId')
  async checkAdmin(@Param('userId') userId: string) {
    return {
      isAdmin: this.telegramService.isAdmin(userId),
    };
  }

  @Post('admin/service')
  @UseGuards(AdminGuard)
  async createService(@Body() service: Partial<Service>) {
    return this.servicesService.create(service);
  }

  @Post('admin/service/:id')
  @UseGuards(AdminGuard)
  async updateService(@Param('id') id: string, @Body() service: Partial<Service>) {
    return this.servicesService.update(parseInt(id), service);
  }

  @Post('admin/service/:id/delete')
  @UseGuards(AdminGuard)
  async deleteService(@Param('id') id: string) {
    return this.servicesService.remove(parseInt(id));
  }
} 