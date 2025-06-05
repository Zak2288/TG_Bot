@echo off
echo Начинаем процесс объединения баз данных...
echo.

echo Шаг 1: Создание резервных копий баз данных
echo Создание дампа структуры базы данных business_management_new...
pg_dump -h localhost -U postgres -d business_management_new --schema-only -f business_management_new_schema.sql
if %ERRORLEVEL% NEQ 0 goto error

echo Создание дампа структуры базы данных cvet_vzgliada...
pg_dump -h localhost -U postgres -d cvet_vzgliada --schema-only -f cvet_vzgliada_schema.sql
if %ERRORLEVEL% NEQ 0 goto error

echo Создание дампа данных из business_management_new...
pg_dump -h localhost -U postgres -d business_management_new --data-only -f business_management_new_data.sql
if %ERRORLEVEL% NEQ 0 goto error

echo Создание дампа данных из cvet_vzgliada...
pg_dump -h localhost -U postgres -d cvet_vzgliada --data-only -f cvet_vzgliada_data.sql
if %ERRORLEVEL% NEQ 0 goto error

echo.
echo Шаг 2: Создание новой объединенной базы данных
echo Удаление старой базы данных, если она существует...
psql -h localhost -U postgres -d postgres -c "DROP DATABASE IF EXISTS business_management_combined;"
if %ERRORLEVEL% NEQ 0 goto error

echo Создание новой базы данных...
psql -h localhost -U postgres -d postgres -c "CREATE DATABASE business_management_combined;"
if %ERRORLEVEL% NEQ 0 goto error

echo.
echo Шаг 3: Восстановление структуры из business_management_new в новую базу
psql -h localhost -U postgres -d business_management_combined -f business_management_new_schema.sql
if %ERRORLEVEL% NEQ 0 goto error

echo.
echo Шаг 4: Восстановление данных из business_management_new
psql -h localhost -U postgres -d business_management_combined -f business_management_new_data.sql
if %ERRORLEVEL% NEQ 0 goto error

echo.
echo Шаг 5: Анализ структуры cvet_vzgliada и выявление уникальных таблиц

echo Создание временного файла для хранения списка таблиц из business_management_new...
psql -h localhost -U postgres -d business_management_new -c "\dt" -o business_management_new_tables.txt
if %ERRORLEVEL% NEQ 0 goto error

echo Создание временного файла для хранения списка таблиц из cvet_vzgliada...
psql -h localhost -U postgres -d cvet_vzgliada -c "\dt" -o cvet_vzgliada_tables.txt
if %ERRORLEVEL% NEQ 0 goto error

echo.
echo Шаг 6: Обновление конфигурации
echo Обновление файла .env для указания новой базы данных...
powershell -Command "(Get-Content .env) -replace 'DB_DATABASE=business_management_new', 'DB_DATABASE=business_management_combined' | Set-Content .env"
if %ERRORLEVEL% NEQ 0 goto error

echo.
echo Процесс объединения завершен!
echo Теперь ваше приложение настроено на использование объединенной базы данных business_management_combined.
echo Пожалуйста, проверьте работу приложения перед удалением старых баз данных.
echo.
echo Для удаления старых баз данных выполните следующие команды:
echo psql -h localhost -U postgres -d postgres -c "DROP DATABASE business_management_new;"
echo psql -h localhost -U postgres -d postgres -c "DROP DATABASE cvet_vzgliada;"
goto end

:error
echo.
echo Произошла ошибка в процессе объединения баз данных.
echo Проверьте сообщения об ошибках выше.

:end
pause 