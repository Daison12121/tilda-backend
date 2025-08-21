-- SQL скрипт для настройки базы данных Supabase
-- Выполните эти команды в SQL Editor вашего проекта Supabase

-- 1. Создание таблицы пользователей (если еще не создана)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Создание таблицы токенов для авторизации
CREATE TABLE IF NOT EXISTS tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

-- 3. Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_email ON tokens(email);
CREATE INDEX IF NOT EXISTS idx_tokens_expires_at ON tokens(expires_at);

-- 4. Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Триггер для автоматического обновления updated_at в таблице users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Функция для очистки истекших токенов
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM tokens WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Вставка тестовых данных (опционально)
INSERT INTO users (email, name, phone) VALUES 
    ('test@example.com', 'Тестовый Пользователь', '+7 (999) 123-45-67'),
    ('admin@example.com', 'Администратор', '+7 (999) 987-65-43'),
    ('user@example.com', 'Обычный Пользователь', '+7 (999) 555-55-55')
ON CONFLICT (email) DO NOTHING;

-- 8. Настройка RLS (Row Level Security) - опционально
-- Если вы хотите использовать RLS, раскомментируйте следующие строки:

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view own data" ON users
--     FOR SELECT USING (auth.email() = email);

-- CREATE POLICY "Tokens can be viewed by owner" ON tokens
--     FOR SELECT USING (auth.email() = email);

-- 9. Создание представления для статистики (опционально)
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30_days,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as new_users_7_days
FROM users;

-- 10. Создание представления для активных токенов
CREATE OR REPLACE VIEW active_tokens AS
SELECT 
    token,
    email,
    created_at,
    expires_at,
    (expires_at > NOW()) as is_valid
FROM tokens
WHERE expires_at > NOW();

-- Готово! Ваша база данных настроена для работы с системой авторизации.