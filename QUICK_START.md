# 🚀 Быстрый старт - Решение проблемы Тильды

## ⚡ Что нужно сделать прямо сейчас

### 1. Получите URL вашего Railway приложения
- Зайдите в ваш проект на Railway
- Скопируйте URL (например: `https://your-app-name.railway.app`)

### 2. Обновите конфигурацию

**В файле `tilda-script.js` (строка 6):**
```javascript
const BACKEND_URL = 'https://your-railway-app.railway.app'; // ЗАМЕНИТЕ НА ВАШ URL
```

**В файле `user-profile.html` (строка 67):**
```javascript
const BACKEND_URL = 'https://your-railway-app.railway.app'; // ЗАМЕНИТЕ НА ВАШ URL
```

### 3. Разверните обновленный код на Railway

```bash
git add .
git commit -m "Add solutions for Tilda document.write issue"
git push
```

### 4. Выберите решение

## 🎯 Решение 1: Устойчивый JavaScript (Рекомендуется)

**Что делать:**
1. Откройте файл `tilda-script.js`
2. Скопируйте весь код
3. В Тильде перейдите на страницу личного кабинета
4. Добавьте блок "HTML-код"
5. Вставьте скопированный код
6. Сохраните и опубликуйте страницу

**Преимущества:**
- ✅ Работает прямо на странице Тильды
- ✅ Автоматически восстанавливается после document.write()
- ✅ Не требует дополнительных iframe

## 🎯 Решение 2: Отдельная страница профиля

**Что делать:**
1. Убедитесь, что код развернут на Railway
2. В Тильде добавьте блок "HTML-код"
3. Вставьте этот код:

```html
<div id="profile-container" style="width: 100%; min-height: 600px;">
    <div style="text-align: center; padding: 40px;">
        <div style="border: 3px solid #f3f3f3; border-top: 3px solid #667eea; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
        <p>Загрузка профиля...</p>
    </div>
</div>

<style>
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>

<script>
(function() {
    const BACKEND_URL = 'https://your-railway-app.railway.app'; // ЗАМЕНИТЕ НА ВАШ URL
    
    function getUserEmail() {
        // Способы получения email авторизованного пользователя
        return localStorage.getItem('tilda_user_email') || 
               localStorage.getItem('user_email') ||
               sessionStorage.getItem('tilda_user_email') ||
               'test@example.com'; // Замените на реальную логику
    }
    
    function loadProfile() {
        const email = getUserEmail();
        const container = document.getElementById('profile-container');
        
        if (email && container) {
            const iframe = document.createElement('iframe');
            iframe.src = `${BACKEND_URL}/profile?email=${encodeURIComponent(email)}`;
            iframe.style.cssText = 'width: 100%; height: 600px; border: none; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);';
            
            container.innerHTML = '';
            container.appendChild(iframe);
        }
    }
    
    // Запуск с задержкой для завершения авторизации
    setTimeout(loadProfile, 1000);
    
    // Повторные попытки
    let attempts = 0;
    const interval = setInterval(() => {
        attempts++;
        if (attempts > 5) {
            clearInterval(interval);
            return;
        }
        
        const email = getUserEmail();
        if (email !== 'test@example.com') {
            loadProfile();
            clearInterval(interval);
        }
    }, 2000);
})();
</script>
```

## 🧪 Тестирование

### Локальное тестирование:
```bash
# Запустите сервер
npm start

# Откройте в браузере:
http://localhost:3000/profile?email=test@example.com
```

### На Railway:
```
https://your-railway-app.railway.app/profile?email=test@example.com
```

## 🔧 Настройка получения email пользователя

В обоих решениях нужно настроить функцию `getUserEmail()`. Вот несколько вариантов:

### Вариант 1: Из localStorage
```javascript
function getUserEmail() {
    return localStorage.getItem('user_email') || 
           localStorage.getItem('tilda_user_email');
}
```

### Вариант 2: Из cookies
```javascript
function getUserEmail() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'user_email') {
            return decodeURIComponent(value);
        }
    }
    return null;
}
```

### Вариант 3: Из глобальных переменных Тильды
```javascript
function getUserEmail() {
    return window.tildaForm?.userEmail || 
           window.currentUser?.email;
}
```

## 🐛 Отладка

Откройте консоль браузера (F12) и проверьте:

1. **Загружается ли скрипт:**
   ```javascript
   console.log('Скрипт загружен');
   ```

2. **Находится ли email:**
   ```javascript
   console.log('Email пользователя:', getUserEmail());
   ```

3. **Работает ли API:**
   ```javascript
   fetch('https://your-railway-app.railway.app/health')
       .then(r => r.json())
       .then(console.log);
   ```

## 📞 Поддержка

Если что-то не работает:
1. Проверьте консоль браузера на ошибки
2. Убедитесь, что Railway приложение работает
3. Проверьте правильность URL в конфигурации
4. Убедитесь, что функция получения email возвращает корректное значение