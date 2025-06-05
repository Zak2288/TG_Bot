-- Скрипт для объединения баз данных business_management_new и cvet_vzgliada
-- Выполняйте каждый блок по отдельности

-- 1. Создание дампа структуры базы данных business_management_new
-- Выполните в командной строке:
-- pg_dump -h localhost -U postgres -d business_management_new --schema-only -f business_management_new_schema.sql

-- 2. Создание дампа структуры базы данных cvet_vzgliada
-- Выполните в командной строке:
-- pg_dump -h localhost -U postgres -d cvet_vzgliada --schema-only -f cvet_vzgliada_schema.sql

-- 3. Создание дампа данных из business_management_new
-- Выполните в командной строке:
-- pg_dump -h localhost -U postgres -d business_management_new --data-only -f business_management_new_data.sql

-- 4. Создание дампа данных из cvet_vzgliada
-- Выполните в командной строке:
-- pg_dump -h localhost -U postgres -d cvet_vzgliada --data-only -f cvet_vzgliada_data.sql

-- 5. Создание новой объединенной базы данных
CREATE DATABASE business_management_combined;

-- 6. Восстановление структуры из business_management_new в новую базу
-- Выполните в командной строке:
-- psql -h localhost -U postgres -d business_management_combined -f business_management_new_schema.sql

-- 7. Анализ структуры cvet_vzgliada и добавление недостающих таблиц
-- После анализа дампа cvet_vzgliada_schema.sql, выполните следующие запросы:
-- 7.1. Получение списка таблиц из cvet_vzgliada
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_catalog = 'cvet_vzgliada';

-- 7.2. Получение списка таблиц из business_management_new
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_catalog = 'business_management_new';

-- 7.3. Добавьте структуру недостающих таблиц из cvet_vzgliada в business_management_combined
-- Анализируйте cvet_vzgliada_schema.sql и добавляйте структуры таблиц, которых нет в business_management_new

-- 8. Восстановление данных из business_management_new
-- Выполните в командной строке:
-- psql -h localhost -U postgres -d business_management_combined -f business_management_new_data.sql

-- 9. Восстановление данных из cvet_vzgliada (только для таблиц, которых нет в business_management_new)
-- Анализируйте cvet_vzgliada_data.sql и выполняйте вставку данных только для таблиц, которых нет 
-- в business_management_new или таблиц, которые не конфликтуют

-- 10. Обновление конфигурации в .env
-- Измените файл .env, заменив:
-- DB_DATABASE=business_management_new
-- на:
-- DB_DATABASE=business_management_combined

-- 11. Проверка новой базы данных
-- SELECT table_name, (SELECT COUNT(*) FROM information_schema.columns WHERE table_name=t.table_name) AS column_count
-- FROM information_schema.tables t WHERE table_schema = 'public';

-- 12. Удаление старых баз данных (выполнять только после полной проверки работоспособности)
-- DROP DATABASE business_management_new;
-- DROP DATABASE cvet_vzgliada;

-- ВАЖНО: Перед выполнением каждого шага делайте резервные копии данных!
-- Если возникают ошибки при импорте данных из-за нарушения внешних ключей,
-- используйте опцию --disable-triggers при pg_dump или временно отключите проверки:
-- SET session_replication_role = 'replica';
-- ... импорт данных ...
-- SET session_replication_role = 'origin'; 