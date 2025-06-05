# Инструкция по объединению баз данных

Этот документ содержит подробные инструкции по объединению баз данных `business_management_new` и `cvet_vzgliada` в единую базу данных `business_management_combined`.

## Подготовка

1. **Убедитесь, что у вас установлены следующие инструменты:**
   - PostgreSQL (должен быть доступен из командной строки)
   - psql (клиент PostgreSQL)
   - pg_dump (утилита для создания резервных копий)

2. **Закройте все соединения с базами данных:**
   - Закройте DBeaver или другие клиенты PostgreSQL
   - Остановите приложение, если оно запущено

## Автоматическое объединение (рекомендуется)

1. **Запустите скрипт автоматического объединения:**
   ```
   merge-database.bat
   ```

2. **Введите пароль PostgreSQL при запросе:**
   Для пользователя `postgres` введите пароль `1703`, когда будет запрошено.

3. **Дождитесь завершения процесса:**
   Скрипт выполнит все необходимые шаги и сообщит о завершении.

4. **Проверьте результат:**
   Запустите приложение и проверьте, что все данные доступны.

## Ручное объединение (для опытных пользователей)

Если автоматический скрипт не работает или вы хотите больше контроля над процессом, выполните следующие шаги:

### Шаг 1: Создание резервных копий

```bash
# Создание дампа структуры базы данных business_management_new
pg_dump -h localhost -U postgres -d business_management_new --schema-only -f business_management_new_schema.sql

# Создание дампа структуры базы данных cvet_vzgliada
pg_dump -h localhost -U postgres -d cvet_vzgliada --schema-only -f cvet_vzgliada_schema.sql

# Создание дампа данных из business_management_new
pg_dump -h localhost -U postgres -d business_management_new --data-only -f business_management_new_data.sql

# Создание дампа данных из cvet_vzgliada
pg_dump -h localhost -U postgres -d cvet_vzgliada --data-only -f cvet_vzgliada_data.sql
```

### Шаг 2: Создание новой объединенной базы данных

```bash
# Подключение к postgres
psql -h localhost -U postgres -d postgres

# Выполнение SQL-команды для создания новой базы
CREATE DATABASE business_management_combined;

# Выход из psql
\q
```

### Шаг 3: Восстановление структуры и данных

```bash
# Восстановление структуры из business_management_new
psql -h localhost -U postgres -d business_management_combined -f business_management_new_schema.sql

# Восстановление данных из business_management_new
psql -h localhost -U postgres -d business_management_combined -f business_management_new_data.sql
```

### Шаг 4: Анализ и перенос уникальных таблиц из cvet_vzgliada

1. **Сравните таблицы в обеих базах:**
   ```bash
   # Получение списка таблиц из business_management_new
   psql -h localhost -U postgres -d business_management_new -c "\dt" -o business_management_new_tables.txt

   # Получение списка таблиц из cvet_vzgliada
   psql -h localhost -U postgres -d cvet_vzgliada -c "\dt" -o cvet_vzgliada_tables.txt
   ```

2. **Проанализируйте файлы и определите уникальные таблицы в cvet_vzgliada**

3. **Для каждой уникальной таблицы создайте структуру в новой базе:**
   ```bash
   # Пример для таблицы unique_table
   pg_dump -h localhost -U postgres -d cvet_vzgliada --schema-only --table=unique_table -f unique_table_schema.sql
   psql -h localhost -U postgres -d business_management_combined -f unique_table_schema.sql
   ```

4. **Перенесите данные для каждой уникальной таблицы:**
   ```bash
   # Пример для таблицы unique_table
   pg_dump -h localhost -U postgres -d cvet_vzgliada --data-only --table=unique_table -f unique_table_data.sql
   psql -h localhost -U postgres -d business_management_combined -f unique_table_data.sql
   ```

### Шаг 5: Проверка целостности данных

```bash
# Запустите скрипт проверки базы данных
psql -h localhost -U postgres -d business_management_combined -f check-database.sql
```

### Шаг 6: Обновление конфигурации

1. **Отредактируйте файл .env:**
   Измените значение `DB_DATABASE` с `business_management_new` на `business_management_combined`.

2. **Перезапустите приложение и проверьте его работу**

## Удаление старых баз данных

**ВАЖНО:** Выполняйте этот шаг только после полной проверки работоспособности системы с новой объединенной базой данных.

```bash
# Подключение к postgres
psql -h localhost -U postgres -d postgres

# Выполнение SQL-команд для удаления старых баз
DROP DATABASE business_management_new;
DROP DATABASE cvet_vzgliada;

# Выход из psql
\q
```

## Решение проблем

### Ошибка "база данных используется"

```bash
# Закрытие всех соединений с базой данных business_management_new
psql -h localhost -U postgres -d postgres -c "
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'business_management_new' AND pid <> pg_backend_pid();"

# Закрытие всех соединений с базой данных cvet_vzgliada
psql -h localhost -U postgres -d postgres -c "
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'cvet_vzgliada' AND pid <> pg_backend_pid();"
```

### Ошибка нарушения ограничений внешних ключей

```bash
# Временное отключение проверок внешних ключей
psql -h localhost -U postgres -d business_management_combined -c "SET session_replication_role = 'replica';"

# Выполнение импорта данных...

# Включение проверок внешних ключей
psql -h localhost -U postgres -d business_management_combined -c "SET session_replication_role = 'origin';"
``` 