import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Telegraf, Context, Markup } from 'telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../appointments/appointments.entity';
import { Client } from '../clients/clients.entity';
import { Service } from '../services/services.entity';
import { Branch } from '../branches/branches.entity';
import { AppointmentStatus } from '../../shared/enums/appointment-status.enum';
import { Source } from '../../shared/enums/source.enum';
import { ClientsService } from '../clients/clients.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { BranchesService } from '../branches/branches.service';
import { ServicesService } from '../services/services.service';
import { telegramConfig } from '../../config/telegram.config';
import { Between, Not } from 'typeorm';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Telegraf;
  private userStates: Map<number, any> = new Map();
  private readonly ADMIN_CHAT_ID = '927338184';
  private readonly ADDITIONAL_CHAT_ID = '927338184';
  protected readonly GROUP_CHAT_ID = '-1002193338521';

  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    private clientsService: ClientsService,
    private appointmentsService: AppointmentsService,
    private branchesService: BranchesService,
    private servicesService: ServicesService,
  ) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN не задан в переменных окружения');
    }
    this.bot = new Telegraf(token);
    this.setupBotCommands();
    this.initializeTestData();
  }

  // Инициализация бота при запуске модуля
  async onModuleInit() {
    try {
      this.logger.log('Запуск Telegram бота...');
      await this.bot.launch();
      this.logger.log('Telegram бот успешно запущен!');
    } catch (error) {
      this.logger.error(`Ошибка запуска Telegram бота: ${error.message}`);
    }
  }

  // Настройка команд бота
  private setupBotCommands() {
    // Обработка команды /start
    this.bot.start(async (ctx) => {
      // Отправляем приветственный стикер
      await ctx.sendSticker('CAACAgIAAxkBAAEOR29n-DcppFsZIT4OxOVpTr9LoIOCEgACKkcAAmHaaEirAAENkFgUrmg2BA');
      
      return ctx.reply(
        'Добро пожаловать, ЦВЕТ ВЗГЛЯДА рады Вам. Данный бот для записи на радужку глаз!\n\n' + 
        'Доступные команды:\n' +
        '/appointment - Записаться на приём\n' +
        '/mybookings - Мои записи\n' +
        '/price - Посмотреть прайс\n' +
        '/cancel - Отменить запись\n' +
        '/help - Помощь',
        Markup.keyboard([
          ['📝 Записаться', '📋 Мои записи'],
          ['💰 Прайс', '❓ Помощь']
        ]).resize()
      );
    });

    // Обработка команды /help
    this.bot.help((ctx) => {
      return ctx.reply(
        'Этот бот поможет вам записаться к специалисту, просмотреть существующие записи или отменить запись.\n\n' +
        'Доступные команды:\n' +
        '/appointment - Записаться на приём\n' +
        '/mybookings - Мои записи\n' +
        '/price - Посмотреть прайс\n' +
        '/cancel - Отменить запись'
      );
    });

    // Запись на приём
    this.bot.command('appointment', (ctx) => this.startAppointmentFlow(ctx));
    this.bot.hears('📝 Записаться', (ctx) => this.startAppointmentFlow(ctx));

    // Просмотр записей пользователя
    this.bot.command('mybookings', (ctx) => this.showUserAppointments(ctx));
    this.bot.hears('📋 Мои записи', (ctx) => this.showUserAppointments(ctx));

    // Помощь
    this.bot.hears('❓ Помощь', (ctx) => {
      return ctx.reply(
        'Этот бот поможет вам записаться к специалисту, просмотреть существующие записи или отменить запись.\n\n' +
        'Доступные команды:\n' +
        '/appointment - Записаться на приём\n' +
        '/mybookings - Мои записи\n' +
        '/cancel - Отменить запись'
      );
    });

    // Добавляем команды администратора
    this.bot.command('admin', async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId || userId.toString() !== this.ADMIN_CHAT_ID) {
        await ctx.reply('У вас нет прав для использования этой команды.');
        return;
      }

      await ctx.reply(
        '👨‍💼 Панель администратора:\n\n' +
        '/allbookings - Показать все записи\n' +
        '/todaybookings - Записи на сегодня\n' +
        '/tomorrowbookings - Записи на завтра\n' +
        '/cancel_id {ID} - Отменить запись по ID',
        Markup.keyboard([
          ['📋 Все записи', '📅 Записи на сегодня'],
          ['📆 Записи на завтра', '🔙 Назад']
        ]).resize()
      );
    });

    // Показать все записи (только для админа)
    this.bot.command('allbookings', async (ctx) => await this.showAdminAppointments(ctx, 'all'));
    this.bot.hears('📋 Все записи', async (ctx) => await this.showAdminAppointments(ctx, 'all'));

    // Показать записи на сегодня (только для админа)
    this.bot.command('todaybookings', async (ctx) => await this.showAdminAppointments(ctx, 'today'));
    this.bot.hears('📅 Записи на сегодня', async (ctx) => await this.showAdminAppointments(ctx, 'today'));

    // Показать записи на завтра (только для админа)
    this.bot.command('tomorrowbookings', async (ctx) => await this.showAdminAppointments(ctx, 'tomorrow'));
    this.bot.hears('📆 Записи на завтра', async (ctx) => await this.showAdminAppointments(ctx, 'tomorrow'));

    // Отмена записи по ID (только для админа)
    this.bot.command('cancel_id', async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId || userId.toString() !== this.ADMIN_CHAT_ID) {
        await ctx.reply('У вас нет прав для использования этой команды.');
        return;
      }

      const appointmentId = ctx.message.text.split(' ')[1];
      if (!appointmentId) {
        await ctx.reply('Пожалуйста, укажите ID записи. Пример: /cancel_id 123');
        return;
      }

      try {
        const appointment = await this.appointmentRepository.findOne({
          where: { id: parseInt(appointmentId) },
          relations: ['client', 'service', 'branch']
        });

        if (!appointment) {
          await ctx.reply(`Запись с ID ${appointmentId} не найдена.`);
          return;
        }

        // Проверяем, не отменена ли уже запись
        if (appointment.status === AppointmentStatus.CANCELLED) {
          await ctx.reply(`Запись #${appointmentId} уже была отменена ранее.`);
          return;
        }

        await this.appointmentsService.update(parseInt(appointmentId), { 
          status: AppointmentStatus.CANCELLED 
        });

        const message = `❌ Запись #${appointmentId} отменена администратором`;
        
        // Уведомляем в группу
        await this.bot.telegram.sendMessage(this.GROUP_CHAT_ID, message);
        
        // Уведомляем клиента
        try {
          await this.bot.telegram.sendMessage(
            appointment.sourceId,
            '❗️ Ваша запись была отменена администратором'
          );
        } catch (error) {
          this.logger.error(`Не удалось уведомить клиента: ${error.message}`);
        }

        await ctx.reply(`✅ Запись #${appointmentId} успешно отменена.`);
      } catch (error) {
        this.logger.error(`Ошибка при отмене записи: ${error.message}`);
        await ctx.reply('Произошла ошибка при отмене записи.');
      }
    });

    // Обработка действий с записями
    this.bot.action(/cancel_appointment:(\d+)/, async (ctx) => {
      try {
        const userId = ctx.from?.id;
        if (!userId) {
          await ctx.answerCbQuery('Ошибка: не удалось определить пользователя');
          return;
        }

        const appointmentId = +ctx.match[1];
        const appointment = await this.appointmentRepository.findOne({
          where: { id: appointmentId },
          relations: ['client']
        });

        if (!appointment) {
          await ctx.answerCbQuery('Запись не найдена');
          return;
        }

        // Проверяем, не отменена ли уже запись
        if (appointment.status === AppointmentStatus.CANCELLED) {
          await ctx.answerCbQuery('Эта запись уже была отменена ранее');
          return;
        }

        // Проверяем, может ли пользователь отменить эту запись
        const isAdmin = userId.toString() === this.ADMIN_CHAT_ID;
        const isOwner = appointment.sourceId === userId.toString();

        if (!isAdmin && !isOwner) {
          await ctx.answerCbQuery('У вас нет прав для отмены этой записи');
          return;
        }

        // Если это администратор, предлагаем указать причину отмены
        if (isAdmin) {
          await ctx.answerCbQuery('Выберите действие');
          await ctx.editMessageReplyMarkup({
            inline_keyboard: [
              [{ text: '❌ Просто отменить', callback_data: `simple_cancel:${appointmentId}` }],
              [{ text: '📝 Указать причину отмены', callback_data: `cancel_with_reason:${appointmentId}` }]
            ]
          });
          return;
        }

        // Клиент просто отменяет запись
        await this.processSimpleCancellation(ctx, appointment, isAdmin, isOwner);
      } catch (error) {
        this.logger.error(`Ошибка при отмене записи: ${error.message}`);
        await ctx.answerCbQuery('Произошла ошибка при отмене записи');
      }
    });

    // Обработчик простой отмены без указания причины
    this.bot.action(/simple_cancel:(\d+)/, async (ctx) => {
      try {
        const userId = ctx.from?.id;
        if (!userId) {
          await ctx.answerCbQuery('Ошибка: не удалось определить пользователя');
          return;
        }
        
        const appointmentId = +ctx.match[1];
        const appointment = await this.appointmentRepository.findOne({
          where: { id: appointmentId },
          relations: ['client']
        });
        
        if (!appointment) {
          await ctx.answerCbQuery('Запись не найдена');
          return;
        }
        
        const isAdmin = userId.toString() === this.ADMIN_CHAT_ID;
        const isOwner = appointment.sourceId === userId.toString();
        
        await this.processSimpleCancellation(ctx, appointment, isAdmin, isOwner);
      } catch (error) {
        this.logger.error(`Ошибка при простой отмене записи: ${error.message}`);
        await ctx.answerCbQuery('Произошла ошибка при отмене записи');
      }
    });

    // Обработчик отмены с указанием причины
    this.bot.action(/cancel_with_reason:(\d+)/, async (ctx) => {
      try {
        const userId = ctx.from?.id;
        if (!userId) {
          await ctx.answerCbQuery('Ошибка: не удалось определить пользователя');
          return;
        }
        
        const appointmentId = +ctx.match[1];
        await ctx.answerCbQuery('Пожалуйста, укажите причину отмены');
        
        // Сохраняем в состоянии пользователя, что ждем ввода причины отмены
        this.userStates.set(userId, {
          waitingFor: 'cancellation_reason',
          appointmentId: appointmentId
        });
        
        await ctx.editMessageText(
          'Пожалуйста, введите причину отмены записи:',
          { 
            reply_markup: {
              inline_keyboard: [
                [{ text: '❌ Отменить без указания причины', callback_data: `simple_cancel:${appointmentId}` }]
              ]
            }
          }
        );
      } catch (error) {
        this.logger.error(`Ошибка при запросе причины отмены: ${error.message}`);
        await ctx.answerCbQuery('Произошла ошибка при обработке запроса');
      }
    });

    // Добавляем обработчик для новой записи после отмены
    this.bot.action('new_appointment', async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      // Очищаем предыдущее состояние
      this.userStates.delete(userId);

      // Удаляем старое сообщение
      await ctx.deleteMessage();

      // Начинаем новый процесс записи
      await this.startAppointmentFlow(ctx);
    });
    
    // Обработка выбора филиала
    this.bot.action(/select_branch:(\d+)/, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) {
        this.logger.error('Не удалось получить ID пользователя при выборе филиала');
        return;
      }
      
      const branchId = +ctx.match[1];
      const state = this.userStates.get(userId);
      
      this.logger.log(`Выбор филиала для пользователя ${userId}: branchId=${branchId}`);
      this.logger.log(`Текущее состояние: ${JSON.stringify(state)}`);
      
      if (!state || state.waitingFor !== 'branch') {
        this.logger.error(`Неверное состояние для выбора филиала: ${state?.waitingFor}`);
        await ctx.reply('Произошла ошибка. Пожалуйста, начните запись заново.');
        return;
      }
      
      try {
        state.branchId = branchId;
        state.waitingFor = 'service';
        
        // Получаем список услуг
        const services = await this.serviceRepository.find({ where: { isActive: true } });
        
        if (!services || services.length === 0) {
          throw new Error('Нет доступных услуг');
        }
        
        const buttons = services.map(service => 
          Markup.button.callback(service.name, `select_service:${service.id}`)
        );
        
        await ctx.editMessageText(
          'Выберите услугу:',
          Markup.inlineKeyboard(buttons, { columns: 1 })
        );
        
        this.userStates.set(userId, state);
        this.logger.log(`Обновлено состояние после выбора филиала: ${JSON.stringify(state)}`);
      } catch (error) {
        this.logger.error(`Ошибка при выборе филиала: ${error.message}`);
        await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
        this.userStates.delete(userId);
      }
    });
    
    // Обработка выбора услуги
    this.bot.action(/select_service:(\d+)/, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) {
        this.logger.error('Не удалось получить ID пользователя при выборе услуги');
        return;
      }
      
      const serviceId = +ctx.match[1];
      const state = this.userStates.get(userId);
      
      this.logger.log(`Выбор услуги для пользователя ${userId}: serviceId=${serviceId}`);
      this.logger.log(`Текущее состояние: ${JSON.stringify(state)}`);
      
      if (!state || state.waitingFor !== 'service') {
        this.logger.error(`Неверное состояние для выбора услуги: ${state?.waitingFor}`);
        await ctx.reply('Произошла ошибка. Пожалуйста, начните запись заново.');
        return;
      }
      
      try {
        state.serviceId = serviceId;
        state.waitingFor = 'date';
        
        await ctx.editMessageText(
          'Пожалуйста, укажите желаемую дату в формате ДД.ММ.ГГГГ (например, 01.01.2024):'
        );
        
        this.userStates.set(userId, state);
        this.logger.log(`Обновлено состояние после выбора услуги: ${JSON.stringify(state)}`);
      } catch (error) {
        this.logger.error(`Ошибка при выборе услуги: ${error.message}`);
        await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
        this.userStates.delete(userId);
      }
    });

    // Обработка выбора времени
    this.bot.action(/select_time:([0-9:]+)/, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) {
        this.logger.error('Не удалось получить ID пользователя при выборе времени');
        return;
      }
      
      const time = ctx.match[1];
      const state = this.userStates.get(userId);
      
      this.logger.log(`Выбор времени для пользователя ${userId}: time=${time}`);
      this.logger.log(`Текущее состояние: ${JSON.stringify(state)}`);
      
      if (!state || state.waitingFor !== 'time') {
        this.logger.error(`Неверное состояние для выбора времени: ${state?.waitingFor}`);
        await ctx.reply('Произошла ошибка. Пожалуйста, начните запись заново.');
        return;
      }
      
      try {
        this.logger.log('Создание клиента...');
        // Создаем клиента
        const client = await this.clientsService.create({
          name: state.clientName,
          phone: state.clientPhone,
          source: Source.TELEGRAM
        });
        this.logger.log(`Клиент создан: ${JSON.stringify(client)}`);

        // Вычисляем время начала и окончания
        const [hours, minutes] = time.split(':').map(Number);
        const [day, month, year] = state.date.split('.').map(Number);
        // JavaScript месяцы начинаются с 0 (январь - 0, декабрь - 11)
        const startDateTime = new Date(year, month - 1, day);
        startDateTime.setHours(hours, minutes, 0, 0);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
        
        this.logger.log(`Подготовка данных для создания записи:
          clientId: ${client.id}
          branchId: ${state.branchId}
          serviceId: ${state.serviceId}
          startTime: ${startDateTime.toISOString()}
          endTime: ${endDateTime.toISOString()}
          date: ${state.date}, time: ${time}
          Объект startDateTime: ${startDateTime}
          Год: ${startDateTime.getFullYear()}, Месяц: ${startDateTime.getMonth()}, День: ${startDateTime.getDate()}
          Час: ${startDateTime.getHours()}, Минуты: ${startDateTime.getMinutes()}
        `);

        // Создаем запись, убедившись, что даты корректно форматированы
        const appointmentData = {
          clientId: client.id,
          branchId: state.branchId,
          serviceId: state.serviceId,
          startTime: startDateTime, // Оставляем как Date, но убеждаемся, что они корректны
          endTime: endDateTime,     // Оставляем как Date, но убеждаемся, что они корректны
          source: Source.TELEGRAM,
          sourceId: userId.toString(),
          status: AppointmentStatus.SCHEDULED
        };
        
        this.logger.log(`Данные для создания записи: ${JSON.stringify({
          ...appointmentData,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString()
        })}`);

        this.logger.log('Создание записи...');
        const appointment = await this.appointmentsService.create(appointmentData);
        this.logger.log(`Запись создана с ID: ${appointment.id}`);
        this.logger.log(`Детали записи: startTime=${appointment.startTime}, endTime=${appointment.endTime}`);

        // Форматируем дату для отображения
        const formattedDate = `${startDateTime.getDate().toString().padStart(2, '0')}.${(startDateTime.getMonth() + 1).toString().padStart(2, '0')}.${startDateTime.getFullYear()}`;
        const formattedTime = `${startDateTime.getHours().toString().padStart(2, '0')}:${startDateTime.getMinutes().toString().padStart(2, '0')}`;

        // Получаем информацию об услуге
        const service = await this.serviceRepository.findOne({ where: { id: state.serviceId } });
        
        const confirmationMessage = '✅ Запись успешно создана!\n\n' +
          `📅 Дата: ${formattedDate}\n` +
          `⏰ Время: ${formattedTime}\n` +
          `🏢 Филиал: 1 Сокол\n` +
          `💇 Услуга: ${service?.name || 'Не указана'}\n` +
          `👤 Имя: ${state.clientName}\n` +
          `📞 Телефон: ${state.clientPhone}`;

        // Отправляем подтверждение клиенту
        this.logger.log('Отправка подтверждения пользователю...');
        await ctx.editMessageText(confirmationMessage);
        
        // Отправляем стикер успешной записи
        await ctx.sendSticker('CAACAgQAAxkBAAEOR21n-DZL2QPs67iSRdJK7grd0jTbowACRggAAlCz8FMmPNNg2tnfcjYE');
        
        this.logger.log('Подтверждение отправлено');

        // Отправляем уведомления в группу и администратору
        await this.sendNotifications(appointment, confirmationMessage);

        // Очищаем состояние пользователя
        if (ctx.from) {
          this.userStates.delete(ctx.from.id);
        }
      } catch (error) {
        this.logger.error(`Ошибка при создании записи: ${error.message}`);
        this.logger.error(`Стек ошибки: ${error.stack}`);
        await ctx.reply('Произошла ошибка при создании записи. Пожалуйста, попробуйте позже.');
        if (ctx.from) {
          this.userStates.delete(ctx.from.id);
        }
      }
    });

    // Добавляем обработчик для кнопки "Выбрать другую дату"
    this.bot.action('choose_another_date', async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const state = this.userStates.get(userId);
      if (!state) return;

      state.waitingFor = 'date';
      this.userStates.set(userId, state);

      await ctx.editMessageText(
        'Пожалуйста, укажите желаемую дату в формате ДД.ММ.ГГГГ (например, 01.01.2024):'
      );
    });

    // Добавляем обработку команды прайса
    this.bot.command('price', async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const webAppUrl = `${process.env.WEB_APP_URL}/price?userId=${userId}`;
      
      await ctx.reply(
        '💰 Наш прайс-лист:',
        Markup.inlineKeyboard([
          [
            Markup.button.webApp('📱 Открыть в приложении', webAppUrl),
            Markup.button.url('🌐 Открыть в браузере', webAppUrl),
          ],
        ]),
      );
    });

    // Обработка текстовых сообщений
    this.bot.on('text', async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) {
        this.logger.error('Не удалось получить ID пользователя');
        return;
      }
      
      const text = (ctx.message as any).text;
      const state = this.userStates.get(userId);
      
      this.logger.log(`Получено сообщение от пользователя ${userId}: ${text}`);
      this.logger.log(`Текущее состояние: ${JSON.stringify(state)}`);
      
      if (!state || !state.waitingFor) {
        await ctx.reply('Используйте команды бота или кнопки меню для взаимодействия.');
        return;
      }

      try {
        if (state.waitingFor === 'date') {
          const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[012])\.(20\d{2})$/;
          
          if (!dateRegex.test(text)) {
            await ctx.reply('Пожалуйста, введите дату в правильном формате (ДД.ММ.ГГГГ)');
            return;
          }

          // Проверяем, что дата не в прошлом
          const [day, month, year] = text.split('.').map(Number);
          // JavaScript месяцы начинаются с 0 (январь - 0, декабрь - 11)
          const selectedDate = new Date(year, month - 1, day);
          
          // Устанавливаем время на начало дня
          selectedDate.setHours(0, 0, 0, 0);
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          // Добавляем более подробную информацию в лог для диагностики
          this.logger.log(`Проверка даты: 
            Выбранная дата: ${selectedDate.toString()} (${selectedDate.toISOString()})
            Сегодня: ${today.toString()} (${today.toISOString()})
            Завтра: ${tomorrow.toString()} (${tomorrow.toISOString()})
            Выбранная дата < Завтра: ${selectedDate < tomorrow}
            Выбранная дата getTime(): ${selectedDate.getTime()}
            Завтра getTime(): ${tomorrow.getTime()}
            Сравнение с getTime(): ${selectedDate.getTime() < tomorrow.getTime()}
            Разница в днях: ${Math.floor((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))}
          `);
          
          // Для проверки используем явное сравнение годов, месяцев и дней
          const isBeforeTomorrow = (
            selectedDate.getFullYear() < tomorrow.getFullYear() ||
            (selectedDate.getFullYear() === tomorrow.getFullYear() && 
              (selectedDate.getMonth() < tomorrow.getMonth() || 
                (selectedDate.getMonth() === tomorrow.getMonth() && 
                  selectedDate.getDate() < tomorrow.getDate())
              )
            )
          );
          
          if (isBeforeTomorrow) {
            await ctx.reply('Пожалуйста, выберите дату начиная с завтрашнего дня');
            return;
          }
          
          state.date = text;
          state.waitingFor = 'time';
          
          // Получаем доступные временные слоты
          const availableTimeSlots = await this.getAvailableTimeSlots(text, state.branchId);
          
          if (availableTimeSlots.length === 0) {
            await ctx.reply(
              '❌ К сожалению, на выбранную дату нет свободных слотов.\n\n' +
              'Вы можете:\n' +
              '1️⃣ Выбрать другую дату\n' +
              '2️⃣ Связаться с администратором для индивидуального подбора времени',
              Markup.inlineKeyboard([
                [Markup.button.callback('📅 Выбрать другую дату', 'choose_another_date')],
                [Markup.button.url('💬 Связаться с администратором', 'https://t.me/NikaFloks')]
              ])
            );
            state.waitingFor = 'date';
            this.userStates.set(userId, state);
            return;
          }
          
          const buttons = availableTimeSlots.map(time => 
            Markup.button.callback(`⏰ ${time}`, `select_time:${time}`)
          );
          
          await ctx.reply(
            '🕒 Выберите удобное время:',
            Markup.inlineKeyboard(buttons, { columns: 2 })
          );
          
          this.userStates.set(userId, state);
          this.logger.log(`Обновлено состояние после выбора даты: ${JSON.stringify(state)}`);
        } else {
          await this.handleUserResponse(ctx, state);
        }
      } catch (error) {
        this.logger.error(`Ошибка при обработке сообщения: ${error.message}`);
        await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
        if (ctx.from) {
          this.userStates.delete(ctx.from.id);
        }
      }
    });
  }

  // Начало процесса записи
  private async startAppointmentFlow(ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId) {
      this.logger.error('Не удалось получить ID пользователя');
      return ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
    
    try {
      this.logger.log(`Начало процесса записи для пользователя ${userId}`);
      // Запрос имени
      await ctx.reply('Пожалуйста, укажите ваше имя:');
      
      // Инициализация состояния
      const initialState = {
        waitingFor: 'name',
        clientName: null,
        clientPhone: null,
        branchId: null,
        serviceId: null,
        date: null,
        time: null
      };
      
      this.userStates.set(userId, initialState);
      this.logger.log(`Установлено начальное состояние для пользователя ${userId}: ${JSON.stringify(initialState)}`);
    } catch (error) {
      this.logger.error(`Ошибка при начале записи: ${error.message}`);
      await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
  }

  // Обработка ответов пользователя в процессе записи
  private async handleUserResponse(ctx: Context, state: any) {
    const userId = ctx.from?.id;
    if (!userId) return;
    
    const text = (ctx.message as any).text;
    this.logger.log(`Обработка ответа пользователя ${userId}: ${text}`);
    this.logger.log(`Текущее состояние: ${JSON.stringify(state)}`);
    
    try {
      switch (state.waitingFor) {
        case 'name':
          this.logger.log(`Обработка имени для пользователя ${userId}`);
          state.clientName = text;
          state.waitingFor = 'phone';
          await ctx.reply('Укажите ваш номер телефона:');
          this.userStates.set(userId, state);
          this.logger.log(`Обновлено состояние после ввода имени: ${JSON.stringify(this.userStates.get(userId))}`);
          break;
          
        case 'phone':
          this.logger.log(`Обработка телефона для пользователя ${userId}`);
          state.clientPhone = text;
          state.waitingFor = 'branch';
          
          try {
            const startTime = Date.now();
            // Временно используем статический список филиалов
            const branches = [
              { id: 1, name: '1 Сокол' },
              // { id: 2, name: 'Москва' },
              // { id: 3, name: 'Дополнительный филиал 1' },
              // { id: 4, name: 'Дополнительный филиал 2' }
            ];
            
            const buttons = branches.map(branch => Markup.button.callback(branch.name, `select_branch:${branch.id}`));
            
            await ctx.reply(
              'Выберите филиал:',
              Markup.inlineKeyboard(buttons, { columns: 1 })
            );
            
            this.userStates.set(userId, state);
            const endTime = Date.now();
            this.logger.log(`Время обработки выбора филиала: ${endTime - startTime}ms`);
            this.logger.log(`Обновлено состояние после ввода телефона: ${JSON.stringify(this.userStates.get(userId))}`);
          } catch (error) {
            this.logger.error(`Ошибка при получении филиалов: ${error.message}`);
            await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
            this.userStates.delete(userId);
          }
          break;
          
        case 'cancellation_reason':
          this.logger.log(`Обработка причины отмены для пользователя ${userId}`);
          await this.processCancellationWithReason(ctx, state.appointmentId, text);
          break;
          
        default:
          this.logger.warn(`Неизвестное состояние для пользователя ${userId}: ${state.waitingFor}`);
          await ctx.reply('Используйте команды бота или кнопки меню для взаимодействия.');
      }
    } catch (error) {
      this.logger.error(`Ошибка при обработке ответа пользователя: ${error.message}`);
      await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
      if (ctx.from) {
        this.userStates.delete(ctx.from.id);
      }
    }
  }

  // Показать записи пользователя
  private async showUserAppointments(ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId) {
      return ctx.reply('Не удалось получить ваш идентификатор. Пожалуйста, попробуйте позже.');
    }
    
    try {
      const appointments = await this.appointmentRepository.find({
        where: { 
          sourceId: userId.toString(),
          source: Source.TELEGRAM
        },
        relations: ['client', 'service', 'branch']
      });
      
      if (appointments.length === 0) {
        await ctx.reply('У вас пока нет записей.');
        return;
      }
      
      for (const appointment of appointments) {
        const date = new Date(appointment.startTime);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        const client = await this.clientsService.findOne(appointment.clientId);
        if (!client) {
          this.logger.warn(`Клиент с ID ${appointment.clientId} не найден`);
          continue;
        }
        
        await ctx.reply(
          `📅 <b>Запись #${appointment.id}</b>\n` +
          `📆 Дата и время: ${formattedDate}\n` +
          `🏢 Филиал: ${appointment.branch?.name || 'Не указан'}\n` +
          `💇 Услуга: ${appointment.service?.name || 'Не указана'}\n` +
          `📝 Статус: ${this.getStatusText(appointment.status)}`,
          {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
              Markup.button.callback('❌ Отменить запись', `cancel_appointment:${appointment.id}`)
            ])
          }
        );
      }
    } catch (error) {
      this.logger.error(`Ошибка при получении записей: ${error.message}`);
      await ctx.reply('Произошла ошибка при получении записей. Пожалуйста, попробуйте позже.');
    }
  }

  // Получение текста статуса записи
  private getStatusText(status: AppointmentStatus): string {
    const statusMap = {
      [AppointmentStatus.SCHEDULED]: '⏳ Запланирована',
      [AppointmentStatus.CONFIRMED]: '✅ Подтверждена',
      [AppointmentStatus.COMPLETED]: '✓ Завершена',
      [AppointmentStatus.CANCELLED]: '❌ Отменена',
      [AppointmentStatus.NO_SHOW]: '⛔️ Не явился'
    };
    return statusMap[status] || 'Неизвестно';
  }

  // Отправка уведомлений в группу и администратору
  private async sendNotifications(appointment: Appointment, confirmationMessage: string) {
    try {
      // Отправка в группу
      this.logger.log('Отправка уведомления в группу...');
      await this.bot.telegram.sendMessage(
        this.GROUP_CHAT_ID,
        `📝 Новая запись!\n\n${confirmationMessage}`
      );
      this.logger.log('Уведомление в группу отправлено');

      // Отправка администратору
      this.logger.log('Отправка уведомления администратору...');
      await this.bot.telegram.sendMessage(
        this.ADMIN_CHAT_ID,
        `🔔 Новая запись!\n\n${confirmationMessage}\n\n` +
        `🆔 ID записи: ${appointment.id}`
      );
      this.logger.log('Уведомление администратору отправлено');

      // Отправка дополнительному пользователю
      this.logger.log('Отправка уведомления дополнительному пользователю...');
      await this.bot.telegram.sendMessage(
        this.ADDITIONAL_CHAT_ID,
        `🔔 Новая запись!\n\n${confirmationMessage}\n\n` +
        `🆔 ID записи: ${appointment.id}`
      );
      this.logger.log('Уведомление дополнительному пользователю отправлено');

    } catch (error) {
      this.logger.error(`Ошибка при отправке уведомлений: ${error.message}`);
    }
  }

  // Получение доступных временных слотов
  private async getAvailableTimeSlots(date: string, branchId: number): Promise<string[]> {
    try {
      // Все возможные временные слоты
      const allTimeSlots = ['16:00', '17:00', '18:00', '19:00'];
      
      // Получаем все записи на выбранную дату
      const [day, month, year] = date.split('.').map(Number);
      // JavaScript месяцы начинаются с 0 (январь - 0, декабрь - 11)
      const selectedDate = new Date(year, month - 1, day);
      selectedDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      this.logger.log(`Поиск свободных слотов на дату: ${selectedDate.toISOString()}, nextDay: ${nextDay.toISOString()}`);
      
      const existingAppointments = await this.appointmentRepository.find({
        where: {
          branchId: branchId,
          startTime: Between(selectedDate, nextDay),
          status: Not(AppointmentStatus.CANCELLED) // Исключаем отмененные записи
        }
      });

      // Фильтруем занятые слоты
      const bookedTimes = existingAppointments.map(appointment => {
        const time = new Date(appointment.startTime);
        return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
      });

      this.logger.log(`Найдено ${existingAppointments.length} записей, занятые слоты: ${bookedTimes.join(', ')}`);
      
      // Возвращаем только доступные слоты
      return allTimeSlots.filter(time => !bookedTimes.includes(time));
    } catch (error) {
      this.logger.error(`Ошибка при получении доступных слотов: ${error.message}`);
      return [];
    }
  }

  private async initializeTestData() {
    try {
      // Создаем филиалы
      const branches = await this.branchRepository.find();
      if (branches.length === 0) {
        const branch1 = this.branchRepository.create({
          name: 'Цвет Взгляда - Центр',
          address: 'ул. Центральная, 1',
          phone: '+7 (123) 456-78-90',
          isActive: true,
          workingHoursStart: '09:00',
          workingHoursEnd: '21:00',
        });

        const branch2 = this.branchRepository.create({
          name: 'Цвет Взгляда - Север',
          address: 'ул. Северная, 2',
          phone: '+7 (123) 456-78-91',
          isActive: true,
          workingHoursStart: '10:00',
          workingHoursEnd: '20:00',
        });

        await this.branchRepository.save([branch1, branch2]);
        this.logger.log('Тестовые филиалы созданы');
      }

      // Создаем услуги
      const services = await this.serviceRepository.find();
      if (services.length === 0) {
        const branch1 = await this.branchRepository.findOne({ where: { name: 'Цвет Взгляда - Центр' } });
        const branch2 = await this.branchRepository.findOne({ where: { name: 'Цвет Взгляда - Север' } });

        if (branch1) {
          const service1 = this.serviceRepository.create({
            name: 'Стрижка женская',
            price: 1500,
            category: 'Парикмахерские услуги',
            description: 'Классическая женская стрижка',
            duration: 60,
            branchId: branch1.id,
            isActive: true,
          });

          const service2 = this.serviceRepository.create({
            name: 'Окрашивание волос',
            price: 3000,
            category: 'Парикмахерские услуги',
            description: 'Полное окрашивание волос',
            duration: 120,
            branchId: branch1.id,
            isActive: true,
          });

          await this.serviceRepository.save([service1, service2]);
        }

        if (branch2) {
          const service3 = this.serviceRepository.create({
            name: 'Маникюр',
            price: 1000,
            category: 'Ногтевой сервис',
            description: 'Классический маникюр',
            duration: 60,
            branchId: branch2.id,
            isActive: true,
          });

          await this.serviceRepository.save(service3);
        }

        this.logger.log('Тестовые услуги созданы');
      }
    } catch (error) {
      this.logger.error(`Ошибка при инициализации тестовых данных: ${error.message}`);
    }
  }

  // Метод для показа записей администратору
  private async showAdminAppointments(ctx: Context, type: 'all' | 'today' | 'tomorrow') {
    const userId = ctx.from?.id;
    if (!userId || userId.toString() !== this.ADMIN_CHAT_ID) {
      await ctx.reply('У вас нет прав для просмотра этой информации.');
      return;
    }

    try {
      let whereCondition: any = {};
      const now = new Date();
      
      if (type === 'today') {
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        whereCondition = {
          startTime: Between(now, endOfDay)
        };
      } else if (type === 'tomorrow') {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const endOfTomorrow = new Date(tomorrow);
        endOfTomorrow.setHours(23, 59, 59, 999);
        whereCondition = {
          startTime: Between(tomorrow, endOfTomorrow)
        };
      }

      const appointments = await this.appointmentRepository.find({
        where: whereCondition,
        relations: ['client', 'service', 'branch'],
        order: { startTime: 'ASC' }
      });

      if (appointments.length === 0) {
        await ctx.reply(type === 'all' ? 
          'Нет активных записей.' : 
          `Нет записей на ${type === 'today' ? 'сегодня' : 'завтра'}.`
        );
        return;
      }

      for (const appointment of appointments) {
        const date = new Date(appointment.startTime);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        await ctx.reply(
          `📅 <b>Запись #${appointment.id}</b>\n` +
          `📆 Дата и время: ${formattedDate}\n` +
          `👤 Клиент: ${appointment.client?.name || 'Не указан'}\n` +
          `📞 Телефон: ${appointment.client?.phone || 'Не указан'}\n` +
          `🏢 Филиал: ${appointment.branch?.name || 'Не указан'}\n` +
          `💇 Услуга: ${appointment.service?.name || 'Не указана'}\n` +
          `📝 Статус: ${this.getStatusText(appointment.status)}`,
          {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
              [
                Markup.button.callback('❌ Отменить', `cancel_appointment:${appointment.id}`),
                Markup.button.url('💬 Написать клиенту', `tg://user?id=${appointment.sourceId}`)
              ]
            ])
          }
        );
      }
    } catch (error) {
      this.logger.error(`Ошибка при получении записей: ${error.message}`);
      await ctx.reply('Произошла ошибка при получении записей.');
    }
  }

  // Вспомогательный метод для обработки простой отмены
  private async processSimpleCancellation(ctx: Context, appointment: Appointment, isAdmin: boolean, isOwner: boolean) {
    const appointmentId = appointment.id;
    
    // Отменяем запись
    await this.appointmentsService.update(appointmentId, { 
      status: AppointmentStatus.CANCELLED 
    });

    // Отправляем уведомление об отмене
    const message = `