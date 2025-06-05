-- Отключаем соединения
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'business_management'
AND pid <> pg_backend_pid();

-- Удаляем и создаем заново
DROP DATABASE IF EXISTS business_management;
CREATE DATABASE business_management; 