-- Скрипт для получения информации о таблицах в обеих базах данных

-- 1. Подключитесь к базе данных business_management_new и выполните:
SELECT 
    table_name, 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name=t.table_name) AS column_count,
    pg_total_relation_size(quote_ident(table_name)) AS size_in_bytes,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS pretty_size,
    (SELECT COUNT(*) FROM ONLY pg_catalog.pg_class c WHERE c.relname=t.table_name) AS row_count
FROM 
    information_schema.tables t 
WHERE 
    table_schema = 'public'
ORDER BY 
    table_name;

-- 2. Подключитесь к базе данных cvet_vzgliada и выполните:
SELECT 
    table_name, 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name=t.table_name) AS column_count,
    pg_total_relation_size(quote_ident(table_name)) AS size_in_bytes,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS pretty_size,
    (SELECT COUNT(*) FROM ONLY pg_catalog.pg_class c WHERE c.relname=t.table_name) AS row_count
FROM 
    information_schema.tables t 
WHERE 
    table_schema = 'public'
ORDER BY 
    table_name;

-- 3. Получение точной информации о записях в таблицах
-- Для каждой таблицы выполните:
-- SELECT COUNT(*) FROM table_name;

-- 4. Получение структуры таблиц
-- Для таблиц из business_management_new:
SELECT 
    table_name, 
    column_name, 
    data_type, 
    character_maximum_length,
    column_default,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
ORDER BY 
    table_name, 
    ordinal_position;

-- 5. Получение списка первичных ключей и ограничений
SELECT
    tc.table_schema, 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.table_schema = 'public'
ORDER BY 
    tc.table_name, 
    tc.constraint_name; 