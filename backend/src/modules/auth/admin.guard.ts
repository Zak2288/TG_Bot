import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly telegramService: TelegramService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-telegram-user-id'];
    
    return this.telegramService.isAdmin(userId);
  }
} 