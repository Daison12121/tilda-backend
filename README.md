# Интеграция Тильды с Supabase - Решение проблемы document.write()

## Проблема
Тильда использует `document.write()` при авторизации пользователей, что стирает весь JavaScript код, вставленный в блоки HTML.

## Решения

### Решение 1: Устойчивый JavaScript (Рекомендуемое)

Используйте файл `tilda-script.js` - он содержит код, который:
- Отслеживает изменения DOM с помощью MutationObserver
- Автоматически перезапускается после операций Тильды
- Пытается найти email пользователя разными способами
- Отображает данные пользователя на странице

**Как использовать:**
1. Замените `BACKEND_URL` в файле `tilda-script.js` на URL вашего Railway приложения
2. Скопируйте весь код из файла
3. Вставьте в блок "HTML-код" на странице личного кабинета в Тильде

### Решение 2: Iframe с отдельной страницей

Используйте файл `user-profile.html` как отдельную страницу профиля:

**Как использовать:**
1. Замените `BACKEND_URL` в файле `user-profile.html` на URL вашего Railway приложения
2. Разверните обновленный сервер на Railway
3. В Тильде создайте iframe, который ссылается на: `https://your-railway-app.railway.app/profile?email=USER_EMAIL`

**Код для вставки в Тильду:**
```html
<iframe 
    src="https://your-railway-app.railway.app/profile?email=USER_EMAIL" 
    width="100%" 
    height="600" 
    frameborder="0"
    style="border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
</iframe>

<script>
// Получаем email авторизованного пользователя и обновляем iframe
function updateProfileIframe() {
    const iframe = document.querySelector('iframe');
    const userEmail = getUserEmail(); // Функция для получения email
    
    if (userEmail && iframe) {
        const baseUrl = 'https://your-railway-app.railway.app/profile';
        iframe.src = `${baseUrl}?email=${encodeURIComponent(userEmail)}`;
    }
}

// Функция для получения email (адаптируйте под вашу систему авторизации)
function getUserEmail() {
    // Здесь должна быть логика получения email авторизованного пользователя
    return localStorage.getItem('user_email') || 'test@example.com';
}

// Запускаем обновление iframe
setTimeout(updateProfileIframe, 1000);
</script>
```

## Настройка

### 1. Обновите URL бэкенда
В обоих файлах замените:
```javascript
const BACKEND_URL = 'https://your-railway-app.railway.app';
```
на URL вашего Railway приложения.

### 2. Разверните обновленный сервер
```bash
# Установите зависимости (если еще не установлены)
npm install

# Запустите локально для тестирования
npm start

# Разверните на Railway
git add .
git commit -m "Add profile page and static files support"
git push
```

### 3. Тестирование

**Локальное тестирование:**
- Запустите сервер: `npm start`
- Откройте: `http://localhost:3000/profile?email=test@example.com`

**На Railway:**
- Откройте: `https://your-railway-app.railway.app/profile?email=test@example.com`

## API Endpoints

- `GET /` - Информация о сервере
- `GET /health` - Проверка работоспособности
- `GET /user/:email` - Получение данных пользователя по email
- `GET /user?email=...` - Получение данных пользователя через query параметр
- `GET /profile?email=...` - HTML страница профиля пользователя

## Структура базы данных Supabase

Убедитесь, что в вашей таблице `users` есть следующие поля:
- `email` (text, primary key)
- `name` (text)
- `phone` (text)
- `created_at` (timestamp)

## Отладка

Для отладки откройте консоль браузера (F12) и проверьте:
1. Загружается ли скрипт без ошибок
2. Находится ли email пользователя
3. Успешно ли выполняются запросы к API
4. Отображаются ли данные на странице

Функция `window.tildaUserData` доступна для ручного вызова:
```javascript
// Ручная инициализация
window.tildaUserData.init();

// Получение email
console.log(window.tildaUserData.getUserEmail());

// Получение данных пользователя
window.tildaUserData.fetchUserData('test@example.com').then(console.log);
```