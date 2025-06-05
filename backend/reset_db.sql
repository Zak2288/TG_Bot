-- Отключаем все соединения с базой данных
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'business_management' 
AND pid <> pg_backend_pid();

-- Удаляем базу данных, если существует
DROP DATABASE IF EXISTS business_management;

-- Создаем базу данных заново
CREATE DATABASE business_management; 