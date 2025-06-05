# Структура кода проекта "Цвет Взгляда"

## Общая схема проекта

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Система управления бизнесом                       │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
    ┌───────────────────────────┼────────────────────────┐
    │                           │                        │
┌───▼───────────────┐    ┌──────▼─────────┐     ┌────────▼────────┐
│  Frontend (Vue.js) │    │ Backend (NestJS) │     │ Telegram Bot    │
└───────┬───────────┘    └──────┬─────────┘     └────────┬────────┘
        │                       │                        │
        │  ┌───────────────────▼────────────────────────▼──────┐
        │  │                  База данных                       │
        │  │               (PostgreSQL/SQLite)                  │
        │  └────────────────────────────────────────────────────┘
        │
┌───────▼───────────────────────────────────────────────────────┐
│                      Админ-панель                             │
├─────────────────────────────────────────────────────────────┐ │
│ ┌──────────┐ ┌───────────┐ ┌────────────┐ ┌──────────────┐ │ │
│ │ Дашборд  │ │ Записи    │ │ Клиенты    │ │ Услуги       │ │ │
│ └──────────┘ └───────────┘ └────────────┘ └──────────────┘ │ │
│ ┌──────────┐ ┌───────────┐ ┌────────────┐                  │ │
│ │ Филиалы  │ │ Статистика│ │ Настройки  │                  │ │
│ └──────────┘ └───────────┘ └────────────┘                  │ │
└─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Структура файлов проекта

```
business-management-system/
├── frontend/                           # Директория фронтенд-части
│   └── CVET/                           # Основное приложение Vue.js
│       ├── public/                     # Статические файлы
│       ├── src/                        # Исходный код Vue.js
│       │   ├── api/                    # API клиенты для бэкенда
│       │   ├── assets/                 # Изображения и статические ресурсы
│       │   ├── components/             # Vue-компоненты
│       │   ├── router/                 # Vue Router настройки
│       │   ├── store/                  # Vuex хранилище
│       │   ├── views/                  # Vue страницы
│       │   ├── App.vue                 # Корневой Vue-компонент
│       │   └── main.js                 # Точка входа приложения
│       ├── package.json                # Зависимости фронтенда
│       └── vite.config.js              # Конфигурация Vite
│
├── backend/                            # Директория бэкенд-части
│   ├── src/                            # Исходный код NestJS
│   │   ├── auth/                       # Модуль аутентификации
│   │   ├── clients/                    # Модуль управления клиентами
│   │   ├── services/                   # Модуль управления услугами
│   │   ├── appointments/               # Модуль управления записями
│   │   ├── branches/                   # Модуль управления филиалами
│   │   ├── users/                      # Модуль управления пользователями
│   │   ├── telegram/                   # Модуль Telegram бота
│   │   ├── notifications/              # Модуль отправки уведомлений
│   │   ├── app.module.ts               # Главный модуль приложения
│   │   └── main.ts                     # Точка входа приложения
│   │
│   ├── dist/                           # Скомпилированный код
│   ├── package.json                    # Зависимости бэкенда
│   ├── nest-cli.json                   # Конфигурация NestJS
│   └── tsconfig.json                   # Настройки TypeScript
│
├── package.json                        # Корневые зависимости проекта
└── README.md                           # Документация проекта
```

## Основные компоненты кода

### 1. Frontend (Vue.js/Vite)

#### 1.1. Основные файлы и их назначение

**main.js** - Точка входа приложения
```javascript
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err)
  store.dispatch('setNotification', {
    type: 'error',
    message: 'Произошла ошибка в приложении. Пожалуйста, попробуйте еще раз или обратитесь в поддержку.'
  }, { root: true })
}

app.use(router)
app.use(store)
app.mount('#app')
```

**vite.config.js** - Конфигурация Vite
```javascript
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    },
    port: 8080,
    open: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue': ['vue', 'vue-router', 'vuex'],
          'charts': ['chart.js', 'vue-chartjs'],
          'calendar': ['@fullcalendar/core', '@fullcalendar/daygrid', '@fullcalendar/timegrid', '@fullcalendar/vue3']
        }
      }
    }
  }
})
```

#### 1.2. Структура директорий

**router/index.js** - Настройка Vue Router
```javascript
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Login from '@/views/Login.vue'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/appointments',
    name: 'Appointments',
    component: () => import('@/views/Appointments.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/clients',
    name: 'Clients',
    component: () => import('@/views/Clients.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('@/views/Services.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/branches',
    name: 'Branches',
    component: () => import('@/views/Branches.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/Statistics.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Навигационные хуки для проверки аутентификации
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
```

**store/index.js** - Корневое хранилище Vuex
```javascript
import { createStore } from 'vuex'
import auth from './modules/auth'
import appointments from './modules/appointments'
import clients from './modules/clients'
import services from './modules/services'
import branches from './modules/branches'
import notifications from './modules/notifications'

export default createStore({
  state: {
    notification: null
  },
  mutations: {
    SET_NOTIFICATION(state, notification) {
      state.notification = notification
    },
    CLEAR_NOTIFICATION(state) {
      state.notification = null
    }
  },
  actions: {
    setNotification({ commit }, notification) {
      commit('SET_NOTIFICATION', notification)
      setTimeout(() => {
        commit('CLEAR_NOTIFICATION')
      }, 5000)
    }
  },
  modules: {
    auth,
    appointments,
    clients,
    services,
    branches,
    notifications
  }
})
```

**api/client.js** - Настройка клиента Axios
```javascript
import axios from 'axios'
import store from '@/store'
import router from '@/router'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
})

// Интерцептор для добавления токена авторизации
apiClient.interceptors.request.use(
  config => {
    const token = store.getters['auth/token']
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  response => response,
  error => {
    const { status } = error.response || {}
    
    if (status === 401) {
      store.dispatch('auth/logout')
      router.push({ name: 'Login' })
    }
    
    store.dispatch('setNotification', {
      type: 'error',
      message: error.response?.data?.message || 'Произошла ошибка при обращении к серверу'
    })
    
    return Promise.reject(error)
  }
)

export default apiClient
```

### 2. Backend (NestJS)

#### 2.1. Основные файлы и их назначение

**main.ts** - Точка входа бэкенда
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  
  // Глобальная валидация DTO
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // Настройка CORS
  app.enableCors();
  
  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Цвет Взгляда API')
    .setDescription('API для системы управления бизнесом "Цвет Взгляда"')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
}
bootstrap();
```

**app.module.ts** - Корневой модуль NestJS
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ClientsModule } from './clients/clients.module';
import { ServicesModule } from './services/services.module';
import { BranchesModule } from './branches/branches.module';
import { TelegramModule } from './telegram/telegram.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // Загрузка конфигурации из .env файла
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Настройка подключения к базе данных
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'cvet_vzgliada'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
        ssl: configService.get('DB_SSL') === 'true',
      }),
    }),
    
    // Подключение модулей приложения
    AuthModule,
    UsersModule,
    AppointmentsModule,
    ClientsModule,
    ServicesModule,
    BranchesModule,
    TelegramModule,
    NotificationsModule,
  ],
})
export class AppModule {}
```

#### 2.2. Примеры модулей

**auth/auth.module.ts** - Модуль аутентификации
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'secretKey'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

**clients/client.entity.ts** - Пример сущности клиента
```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Appointment } from '../appointments/appointment.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  telegramId: string;

  @Column({ nullable: true })
  telegramUsername: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => Appointment, appointment => appointment.client)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**services/services.service.ts** - Пример сервиса для управления услугами
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  async findAll(): Promise<Service[]> {
    return this.servicesRepository.find({
      order: {
        category: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const service = this.servicesRepository.create(createServiceDto);
    return this.servicesRepository.save(service);
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const service = await this.findOne(id);
    this.servicesRepository.merge(service, updateServiceDto);
    return this.servicesRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const result = await this.servicesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
  }
}
```

**telegram/telegram.service.ts** - Сервис для работы с Telegram ботом
```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context, Markup } from 'telegraf';
import { ClientsService } from '../clients/clients.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { ServicesService } from '../services/services.service';
import { BranchesService } from '../branches/branches.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;

  constructor(
    private configService: ConfigService,
    private clientsService: ClientsService,
    private appointmentsService: AppointmentsService,
    private servicesService: ServicesService,
    private branchesService: BranchesService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN must be defined in environment variables');
    }
    this.bot = new Telegraf(token);
  }

  async onModuleInit() {
    await this.setupBot();
    await this.bot.launch();
    console.log('Telegram bot started successfully');
  }

  private async setupBot() {
    // Обработчик команды /start
    this.bot.start(async (ctx) => {
      await ctx.reply(
        `Добро пожаловать в бот "Цвет Взгляда"!\n\nЗдесь вы можете записаться на диагностику радужки глаза и другие услуги нашего центра.`,
        Markup.keyboard([
          ['📝 Записаться на прием'],
          ['📋 Мои записи'],
          ['💰 Прайс-лист'],
        ]).resize(),
      );
    });

    // Обработка кнопки "Записаться на прием"
    this.bot.hears('📝 Записаться на прием', async (ctx) => {
      const services = await this.servicesService.findAll();
      const serviceButtons = services
        .filter(service => service.active)
        .map(service => [service.name]);

      await ctx.reply(
        'Выберите услугу:',
        Markup.keyboard(serviceButtons).oneTime().resize(),
      );
    });

    // Другие обработчики...
  }

  // Методы для отправки уведомлений пользователям
  async sendAppointmentConfirmation(telegramId: string, appointment: any) {
    try {
      await this.bot.telegram.sendMessage(
        telegramId,
        `Ваша запись подтверждена!\n\nУслуга: ${appointment.service.name}\nДата: ${appointment.date}\nВремя: ${appointment.time}\nФилиал: ${appointment.branch.name}`,
      );
    } catch (error) {
      console.error('Error sending appointment confirmation:', error);
    }
  }
}
```

## Модели базы данных

### 1. Основные сущности

#### 1.1 Пользователи (User)
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ enum: UserRole, default: UserRole.OPERATOR })
  role: UserRole;

  @Column({ nullable: true })
  telegramId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 1.2 Клиенты (Client)
```typescript
@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  telegramId: string;

  @Column({ nullable: true })
  telegramUsername: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => Appointment, appointment => appointment.client)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 1.3 Услуги (Service)
```typescript
@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  duration: number;

  @Column()
  category: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  isIridologyService: boolean;

  @OneToMany(() => Appointment, appointment => appointment.service)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 1.4 Филиалы (Branch)
```typescript
@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'json', nullable: true })
  workingHours: WorkingHours;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => Appointment, appointment => appointment.branch)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 1.5 Записи (Appointment)
```typescript
@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client, client => client.appointments)
  client: Client;

  @ManyToOne(() => Service, service => service.appointments)
  service: Service;

  @ManyToOne(() => Branch, branch => branch.appointments)
  branch: Branch;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  time: string;

  @Column({ enum: AppointmentStatus, default: AppointmentStatus.PENDING })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User, { nullable: true })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## API Endpoints

### 1. Аутентификация

- **POST /api/auth/login** - Вход в систему
- **POST /api/auth/refresh** - Обновление токена
- **GET /api/auth/profile** - Получение профиля текущего пользователя

### 2. Управление пользователями

- **GET /api/users** - Получение списка пользователей
- **GET /api/users/:id** - Получение пользователя по ID
- **POST /api/users** - Создание нового пользователя
- **PATCH /api/users/:id** - Обновление пользователя
- **DELETE /api/users/:id** - Удаление пользователя

### 3. Клиенты

- **GET /api/clients** - Получение списка клиентов
- **GET /api/clients/:id** - Получение клиента по ID
- **POST /api/clients** - Создание нового клиента
- **PATCH /api/clients/:id** - Обновление клиента
- **DELETE /api/clients/:id** - Удаление клиента

### 4. Услуги

- **GET /api/services** - Получение списка услуг
- **GET /api/services/:id** - Получение услуги по ID
- **POST /api/services** - Создание новой услуги
- **PATCH /api/services/:id** - Обновление услуги
- **DELETE /api/services/:id** - Удаление услуги

### 5. Филиалы

- **GET /api/branches** - Получение списка филиалов
- **GET /api/branches/:id** - Получение филиала по ID
- **POST /api/branches** - Создание нового филиала
- **PATCH /api/branches/:id** - Обновление филиала
- **DELETE /api/branches/:id** - Удаление филиала

### 6. Записи на приём

- **GET /api/appointments** - Получение списка записей
- **GET /api/appointments/:id** - Получение записи по ID
- **POST /api/appointments** - Создание новой записи
- **PATCH /api/appointments/:id** - Обновление записи
- **DELETE /api/appointments/:id** - Удаление записи
- **GET /api/appointments/daily** - Получение записей на текущий день
- **GET /api/appointments/weekly** - Получение записей на текущую неделю
- **GET /api/appointments/client/:clientId** - Получение записей клиента

### 7. Telegram-бот

- **POST /api/telegram/webhook** - Обработка webhook от Telegram

## Запуск проекта

Для запуска проекта необходимо выполнить следующие команды:

```bash
# Установка всех зависимостей
npm run install:all

# Запуск проекта в режиме разработки
npm start

# Либо запустить бэкенд и фронтенд по отдельности
npm run start:backend
npm run start:frontend

# Сборка проекта для продакшена
npm run build
``` 