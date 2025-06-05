-- Отключаем ограничения внешних ключей на время исправлений
SET session_replication_role = 'replica';

-- Создаем енумерации, если они не существуют
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status_enum') THEN
        CREATE TYPE appointment_status_enum AS ENUM ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'source_enum') THEN
        CREATE TYPE source_enum AS ENUM ('TELEGRAM', 'WEBSITE', 'PHONE', 'OTHER');
    END IF;
END$$;

-- Проверяем существование и создаем таблицу "services", если её нет
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  category VARCHAR(255),
  duration INTEGER,
  "branchId" INTEGER,
  "isActive" BOOLEAN DEFAULT true
);

-- Создаем тестовые услуги, если их нет
INSERT INTO services (name, price, description, category, duration, "branchId", "isActive")
SELECT 'Диагностика радужки глаза', 1000, 'Полная диагностика состояния здоровья по радужке глаза', 'Диагностика', 60, 1, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Диагностика радужки глаза');

INSERT INTO services (name, price, description, category, duration, "branchId", "isActive")
SELECT 'Консультация специалиста', 500, 'Консультация по результатам диагностики', 'Консультации', 30, 1, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Консультация специалиста');

-- Проверяем существование таблицы "branch", если её нет
CREATE TABLE IF NOT EXISTS branch (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(50),
  "isActive" BOOLEAN DEFAULT true,
  "workingHoursStart" VARCHAR(5),
  "workingHoursEnd" VARCHAR(5),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Создаем тестовый филиал, если его нет
INSERT INTO branch (name, address, phone, "isActive", "workingHoursStart", "workingHoursEnd")
SELECT 'Цвет Взгляда - Центр', 'ул. Центральная, 1', '+7 (123) 456-78-90', true, '09:00', '21:00'
WHERE NOT EXISTS (SELECT 1 FROM branch WHERE name = 'Цвет Взгляда - Центр');

-- Проверяем существование таблицы "client"
CREATE TABLE IF NOT EXISTS client (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  source source_enum DEFAULT 'OTHER',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Проверяем существование таблицы "appointment"
CREATE TABLE IF NOT EXISTS appointment (
  id SERIAL PRIMARY KEY,
  "clientId" INTEGER,
  "branchId" INTEGER,
  "serviceId" INTEGER,
  "startTime" TIMESTAMP,
  "endTime" TIMESTAMP,
  status appointment_status_enum DEFAULT 'SCHEDULED',
  source source_enum DEFAULT 'OTHER',
  "sourceId" VARCHAR(255),
  "cancellationReason" VARCHAR(255)
);

-- Исправляем таблицу appointment - удаляем записи с неправильными внешними ключами
DELETE FROM appointment
WHERE "serviceId" IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM services WHERE services.id = appointment."serviceId"
);

DELETE FROM appointment
WHERE "branchId" IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM branch WHERE branch.id = appointment."branchId"
);

DELETE FROM appointment
WHERE "clientId" IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM client WHERE client.id = appointment."clientId"
);

-- Возвращаем ограничения внешних ключей
SET session_replication_role = 'origin'; 