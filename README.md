
```sql
-- ====================================================
-- 1. Создание базы данных (если ещё не создана)
-- ====================================================
-- Создаём пользователя (если не существует)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'spa_user') THEN
        CREATE USER spa_user WITH PASSWORD 'ваш_пароль';
    END IF;
END $$;

-- Создаём базу данных (если не существует)
SELECT 'CREATE DATABASE spa_db OWNER spa_user'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'spa_db')\gexec

-- Подключаемся к spa_db
\c spa_db

-- ====================================================
-- 2. Удаляем все старые таблицы (если есть) – для чистой установки
-- ====================================================
DROP TABLE IF EXISTS 
    master_services,
    schedule_exceptions,
    work_schedules,
    abonement_usage,
    appointments,
    payments,
    receipt_items,
    abonements,
    supplies,
    products,
    services,
    service_categories,
    rooms,
    masters,
    employee_profiles,
    client_profiles,
    client_contracts,
    bonus_transactions,
    user_roles,
    role_permissions,
    permissions,
    roles,
    users,
    notifications,
    audit_log,
    system_settings
CASCADE;

-- ====================================================
-- 3. Создание таблиц (физическая модель)
-- ====================================================

-- Пользователи и роли
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Клиенты и сотрудники
CREATE TABLE client_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE,
    address TEXT,
    medical_contraindications TEXT,
    referral_source VARCHAR(100),
    card_number VARCHAR(50) UNIQUE,
    discount_percent INTEGER DEFAULT 0,
    card_issued_date DATE,
    card_expiry_date DATE
);

CREATE TABLE employee_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    position VARCHAR(100),
    hire_date DATE
);

CREATE TABLE masters (
    id SERIAL PRIMARY KEY,
    employee_user_id INTEGER UNIQUE NOT NULL REFERENCES employee_profiles(user_id) ON DELETE CASCADE,
    specialization VARCHAR(100),
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    skills_description TEXT
);

CREATE TABLE client_contracts (
    id SERIAL PRIMARY KEY,
    client_user_id INTEGER NOT NULL REFERENCES client_profiles(user_id) ON DELETE CASCADE,
    contract_number VARCHAR(50) NOT NULL,
    signed_date DATE,
    file_path VARCHAR(255)
);

CREATE TABLE bonus_transactions (
    id SERIAL PRIMARY KEY,
    client_user_id INTEGER NOT NULL REFERENCES client_profiles(user_id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('accrual', 'redemption')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Справочники
CREATE TABLE service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    parent_category_id INTEGER REFERENCES service_categories(id)
);

CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INTEGER REFERENCES service_categories(id),
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL,
    name VARCHAR(50),
    capacity INTEGER DEFAULT 1,
    equipment TEXT
);

CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    inn VARCHAR(20)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20),
    purchase_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    current_stock DECIMAL(10,2) DEFAULT 0,
    min_stock DECIMAL(10,2) DEFAULT 0,
    supplier_id INTEGER REFERENCES suppliers(id)
);

CREATE TABLE service_products (
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (service_id, product_id)
);

-- Расписание и запись
CREATE TABLE work_schedules (
    id SERIAL PRIMARY KEY,
    master_id INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_minutes INTEGER DEFAULT 0,
    UNIQUE (master_id, day_of_week)
);

CREATE TABLE schedule_exceptions (
    id SERIAL PRIMARY KEY,
    master_id INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    reason VARCHAR(100)
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    client_user_id INTEGER NOT NULL REFERENCES client_profiles(user_id) ON DELETE RESTRICT,
    master_id INTEGER NOT NULL REFERENCES masters(id) ON DELETE RESTRICT,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_client ON appointments(client_user_id);
CREATE INDEX idx_appointments_master ON appointments(master_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'transfer')),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'paid' CHECK (status IN ('paid', 'refunded'))
);

CREATE TABLE receipt_items (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

CREATE TABLE abonements (
    id SERIAL PRIMARY KEY,
    client_user_id INTEGER NOT NULL REFERENCES client_profiles(user_id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    sessions_total INTEGER NOT NULL,
    sessions_remaining INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    purchase_date DATE NOT NULL,
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'used'))
);

CREATE INDEX idx_abonements_client ON abonements(client_user_id);

CREATE TABLE abonement_usage (
    id SERIAL PRIMARY KEY,
    abonement_id INTEGER NOT NULL REFERENCES abonements(id) ON DELETE CASCADE,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    UNIQUE (appointment_id)
);

-- Системные таблицы
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);

CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT
);

-- ====================================================
-- 4. Начальные данные
-- ====================================================

-- Роли
INSERT INTO roles (name) VALUES
('Клиент'),
('Администратор'),
('Мастер'),
('Владелец'),
('Бухгалтер');

-- Услуги (пример)
INSERT INTO services (name, duration_minutes, price, description) VALUES
('Классический массаж', 60, 2500, 'Расслабляющий массаж всего тела'),
('Антицеллюлитный массаж', 60, 2800, 'Интенсивный массаж проблемных зон'),
('Лимфодренажный массаж', 45, 2200, 'Мягкий массаж для улучшения лимфотока'),
('Спортивный массаж', 60, 3000, 'Глубокий массаж для мышц после тренировок'),
('Рефлексотерапия стоп', 30, 1500, 'Точечный массаж стоп для снятия усталости');

-- Комнаты
INSERT INTO rooms (room_number, name) VALUES
('101', 'Основной зал'),
('102', 'Кабинет массажа');

-- ====================================================
-- 5. Даём права пользователю spa_user
-- ====================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO spa_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO spa_user;
GRANT USAGE ON SCHEMA public TO spa_user;
```
