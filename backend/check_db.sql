-- Проверяем таблицы
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Проверяем структуру таблицы services
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'services';

-- Проверяем данные в таблице services
SELECT * FROM services;

-- Проверяем данные в таблице branch
SELECT * FROM branch;

-- Проверяем данные в таблице client
SELECT * FROM client;

-- Проверяем данные в таблице appointment
SELECT * FROM appointment; 