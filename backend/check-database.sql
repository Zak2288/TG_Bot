-- Скрипт для проверки состояния базы данных после объединения

-- 1. Проверка наличия всех таблиц
SELECT table_name, pg_size_pretty(pg_relation_size(quote_ident(table_name))) AS size
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Проверка количества записей в таблицах
-- Для каждой важной таблицы
SELECT 'users' AS table_name, COUNT(*) FROM users
UNION ALL
SELECT 'clients' AS table_name, COUNT(*) FROM clients
UNION ALL
SELECT 'appointments' AS table_name, COUNT(*) FROM appointments
UNION ALL
SELECT 'services' AS table_name, COUNT(*) FROM services
UNION ALL
SELECT 'branches' AS table_name, COUNT(*) FROM branches;

-- 3. Проверка целостности данных и внешних ключей
SELECT
    conrelid::regclass AS table_from,
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_def
FROM pg_constraint
WHERE contype = 'f'
AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY conrelid::regclass::text, conname;

-- 4. Проверка основных таблиц и их столбцов

-- 4.1 Таблица users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 4.2 Таблица clients
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'clients'
ORDER BY ordinal_position;

-- 4.3 Таблица appointments
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'appointments'
ORDER BY ordinal_position;

-- 4.4 Таблица services
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'services'
ORDER BY ordinal_position;

-- 5. Проверка индексов
SELECT
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public'
ORDER BY
    tablename,
    indexname;

-- 6. Проверка последовательностей
SELECT
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value,
    increment
FROM
    information_schema.sequences
WHERE
    sequence_schema = 'public'
ORDER BY
    sequence_name; 