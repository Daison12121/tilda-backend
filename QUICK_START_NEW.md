# 🚀 Быстрый старт - Новая система авторизации с токенами

## ⚡ Что нужно сделать прямо сейчас

### 1. Настройте базу данных Supabase
1. Откройте ваш проект в Supabase
2. Перейдите в SQL Editor
3. Скопируйте и выполните код из файла `supabase-setup.sql`
4. Убедитесь, что таблицы `users` и `tokens` созданы успешно

### 2. Получите URL вашего Railway приложения
- Зайдите в ваш проект на Railway
- Скопируйте URL (например: `https://your-app-name.railway.app`)

### 3. Обновите конфигурацию

**В файле `tilda-login-script.js` (строка 6):**
```javascript
const BACKEND_URL = 'https://your-railway-app.railway.app'; // ЗАМЕНИТЕ НА ВАШ URL
```

### 4. Разверните обновленный код на Railway

```bash
git add .
git commit -m "Add token-based authentication system"
git push
```

## 🎯 Новая система авторизации

### Как это работает:
1. **Форма входа в Тильде** → отправляет email на ваш сервер
2. **Сервер проверяет пользователя** → генерирует уникальный токен
3. **Перенаправление в кабинет** → пользователь попадает на защищенную страницу
4. **Отображение данных** → токен используется для получения информации

### Настройка формы входа в Тильде

**Что делать:**
1. Создайте страницу с формой входа в Тильде
2. Добавьте поле для ввода email (тип: email)
3. Добавьте блок "HTML-код" и вставьте код из файла `tilda-login-script.js`
4. Сохраните и опубликуйте страницу

**Пример HTML формы для Тильды:**
```html
<div style="max-width: 400px; margin: 0 auto; padding: 20px;">
    <form id="login-form" style="background: #f8f9fa; padding: 30px; border-radius: 12px;">
        <h2 style="text-align: center; margin-bottom: 20px;">Вход в личный кабинет</h2>
        
        <div style="margin-bottom: 20px;">
            <label for="email" style="display: block; margin-bottom: 5px; font-weight: 500;">Email:</label>
            <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px;"
                placeholder="Введите ваш email"
            >
        </div>
        
        <button 
            type="submit" 
            style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer;"
        >
            Войти
        </button>
    </form>
</div>

<!-- Вставьте сюда код из файла tilda-login-script.js -->
```

## 🧪 Тестирование

### Локальное тестирование:
```bash
# Запустите сервер
npm start

# Тестовые URL:
# Главная страница: http://localhost:3000/
# Проверка здоровья: http://localhost:3000/health
# Кабинет с токеном: http://localhost:3000/cabinet?token=test-token
```

### На Railway:
```
# Главная страница
https://your-railway-app.railway.app/

# Проверка API
https://your-railway-app.railway.app/health

# Тест авторизации (POST запрос)
curl -X POST https://your-railway-app.railway.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 📋 Структура проекта

```
tilda-backend/
├── index.js                 # Основной сервер
├── cabinet.html             # Страница личного кабинета
├── tilda-login-script.js    # Скрипт для формы входа в Тильде
├── supabase-setup.sql       # SQL для настройки базы данных
├── .env                     # Переменные окружения
└── package.json             # Зависимости проекта
```

## 🔧 API Endpoints

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/` | Главная страница с информацией |
| GET | `/health` | Проверка работоспособности |
| POST | `/api/login` | Авторизация пользователя |
| GET | `/api/user?token=...` | Получение данных по токену |
| GET | `/user?email=...` | Получение данных по email |
| GET | `/cabinet?token=...` | Страница личного кабинета |

## 🔐 Безопасность

### Особенности системы токенов:
- ✅ Токены генерируются криптографически стойким методом
- ✅ Токены имеют срок действия (24 часа по умолчанию)
- ✅ Токены привязаны к конкретному email
- ✅ Автоматическая очистка истекших токенов
- ✅ Защита от несанкционированного доступа

### Настройка срока действия токенов:
В файле `supabase-setup.sql` измените строку:
```sql
expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
```

## 🐛 Отладка

### Проверка работы формы:
1. Откройте консоль браузера (F12)
2. Заполните форму и отправьте
3. Проверьте логи в консоли
4. Убедитесь, что запрос отправляется на правильный URL

### Проверка базы данных:
```sql
-- Проверить пользователей
SELECT * FROM users;

-- Проверить токены
SELECT * FROM tokens WHERE expires_at > NOW();

-- Очистить истекшие токены
SELECT cleanup_expired_tokens();
```

### Типичные проблемы:

**1. Ошибка "User not found"**
- Убедитесь, что пользователь существует в таблице `users`
- Проверьте правильность email

**2. Ошибка "Invalid token"**
- Проверьте, что токен не истек
- Убедитесь, что токен передается корректно в URL

**3. CORS ошибки**
- Убедитесь, что сервер настроен на прием запросов от Тильды
- Проверьте настройки CORS в `index.js`

## 📞 Поддержка

Если что-то не работает:
1. Проверьте консоль браузера на ошибки
2. Убедитесь, что Railway приложение работает
3. Проверьте правильность URL в конфигурации
4. Убедитесь, что база данных настроена корректно
5. Проверьте, что все таблицы созданы в Supabase

## 🎉 Готово!

После выполнения всех шагов у вас будет:
- ✅ Рабочая форма авторизации в Тильде
- ✅ Безопасная система токенов
- ✅ Красивый личный кабинет
- ✅ Защита от проблем с document.write()
- ✅ Автоматическое перенаправление пользователей