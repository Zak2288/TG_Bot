# CVET

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```


# Система управления бизнесом и записи клиентов

## Обзор проекта

Данная система представляет собой веб-приложение для управления бизнесом с функциями:
- Управление записями клиентов из разных источников (сайт, ВК, Телеграм, Авито)
- Учет продаж по дням
- Управление филиалами
- Аналитика и отчетность

## Технологический стек

### Фронтенд
- Vue.js 3 с Composition API
- Vuex для управления состоянием
- Vue Router для навигации
- Tailwind CSS для стилизации
- Axios для API-запросов
- FullCalendar для календаря записей
- Chart.js для визуализации данных

### Бэкенд
- NestJS (на TypeScript)
- TypeORM для работы с базой данных
- PostgreSQL в качестве СУБД
- JWT для аутентификации
- WebSockets для реал-тайм уведомлений
- Swagger для документации API

### Интеграции
- ВКонтакте API
- Telegram Bot API
- Авито API
- Webhooks для собственного сайта

## Основные функции

### Управление записями клиентов
- Просмотр календаря записей
- Создание/редактирование/удаление записей
- Фильтрация по филиалам, источникам, статусам
- Уведомления о новых записях в реальном времени

### Учет продаж
- Добавление продаж по филиалам
- Ежедневные, недельные, месячные отчеты
- Аналитика по услугам и источникам записей

### Управление филиалами
- Добавление/редактирование филиалов
- Назначение сотрудников по филиалам
- Статистика по эффективности филиалов

### Административные функции
- Управление пользователями и ролями
- Настройка услуг и цен
- Настройка интеграций

## Установка и запуск

### Требования
- Node.js v14+ (рекомендуется v18+)
- PostgreSQL 12+
- NPM или Yarn

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/yourusername/business-management-system.git
cd business-management-system

# Установка зависимостей бэкенда
cd backend
npm install

# Настройка переменных окружения
cp .env.example .env
# Затем отредактируйте .env файл с вашими настройками

# Установка зависимостей фронтенда
cd ../frontend
npm install
```

### Запуск для разработки

```bash
# Запуск бэкенда
cd backend
npm run start:dev

# Запуск фронтенда (в отдельном терминале)
cd frontend
npm run serve
```

### Сборка для продакшена

```bash
# Сборка бэкенда
cd backend
npm run build

# Сборка фронтенда
cd frontend
npm run build
```

## Лицензия

MIT 