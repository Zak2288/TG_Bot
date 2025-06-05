-- Удаляем строки с NULL в поле name
DELETE FROM services WHERE name IS NULL;

-- Добавляем данные в пустую таблицу services, если она существует
INSERT INTO services (name, price, description, category, duration, "branchId", "isActive")
SELECT 'Диагностика радужки глаза', 1000, 'Полная диагностика состояния здоровья по радужке глаза', 'Диагностика', 60, 1, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Диагностика радужки глаза');

INSERT INTO services (name, price, description, category, duration, "branchId", "isActive")
SELECT 'Консультация специалиста', 500, 'Консультация по результатам диагностики', 'Консультации', 30, 1, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Консультация специалиста'); 