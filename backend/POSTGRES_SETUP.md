# Настройка PostgreSQL для проекта

Для запуска проекта с PostgreSQL, выполните следующие шаги:

## 1. Установка PostgreSQL

1. Скачайте и установите PostgreSQL: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
2. При установке запомните:
   - Пароль для пользователя postgres
   - Порт (по умолчанию 5432)

## 2. Настройка базы данных

### Через pgAdmin:

1. Запустите pgAdmin (устанавливается вместе с PostgreSQL)
2. В левой панели разверните "Servers" → "PostgreSQL x" → правый клик на "Databases" → "Create" → "Database..."
3. Введите:
   - Database: `cvet_vzgliada`
   - Owner: `postgres`
4. Нажмите "Save"

### Через командную строку:

1. Откройте командную строку (cmd или PowerShell)
2. Подключитесь к PostgreSQL:
   ```
   psql -U postgres
   ```
3. Введите пароль пользователя postgres
4. Создайте базу данных:
   ```
   CREATE DATABASE cvet_vzgliada;
   ```
5. Выйдите из psql командой `\q`

## 3. Проверка настроек в проекте

1. Проверьте файл `.env`:
   ```
   DB_TYPE=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=1703  # Замените на ваш пароль
   DB_DATABASE=cvet_vzgliada
   ```

## 4. Запуск сервера

1. Перейдите в директорию backend:
   ```
   cd business-management-system/backend
   ```
2. Запустите сервер:
   ```
   npm run restart
   ```

## Примечание

При первом запуске база данных будет создана автоматически с необходимыми таблицами,
благодаря опции `DB_SYNCHRONIZE=true` в файле `.env`. 