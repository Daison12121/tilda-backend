/**
 * 🚀 СКРИПТ ДЛЯ ИНТЕГРАЦИИ ФОРМЫ АВТОРИЗАЦИИ ТИЛЬДЫ
 * 
 * Этот скрипт нужно добавить на страницу с формой авторизации в Тильде.
 * Он перехватывает отправку формы и отправляет данные на ваш сервер.
 * 
 * ИНСТРУКЦИЯ ПО УСТАНОВКЕ:
 * 1. Скопируйте весь этот код
 * 2. В Тильде на странице с формой авторизации добавьте блок "HTML-код"
 * 3. Вставьте этот код в блок
 * 4. Сохраните и опубликуйте страницу
 */

(function() {
    'use strict';
    
    // ⚙️ НАСТРОЙКИ
    const CONFIG = {
        // URL вашего бэкенда на Railway
        BACKEND_URL: 'https://tilda-backend-production.up.railway.app',
        
        // Селекторы для поиска формы (Тильда использует разные классы)
        FORM_SELECTORS: [
            'form[data-form-type="login"]',
            'form.js-form-proccess',
            'form[action*="forms.tildacdn.com"]',
            'form.t-form',
            'form'
        ],
        
        // Селекторы для полей email и password
        EMAIL_SELECTORS: [
            'input[name="email"]',
            'input[type="email"]',
            'input[name="Email"]',
            'input[placeholder*="mail"]',
            'input[placeholder*="почт"]'
        ],
        
        PASSWORD_SELECTORS: [
            'input[name="password"]',
            'input[type="password"]',
            'input[name="Password"]',
            'input[placeholder*="пароль"]',
            'input[placeholder*="Password"]'
        ],
        
        // Время ожидания ответа от сервера (в миллисекундах)
        TIMEOUT: 10000,
        
        // Показывать ли подробные логи в консоли
        DEBUG: true
    };
    
    // 📝 ФУНКЦИЯ ЛОГИРОВАНИЯ
    function log(message, data = null) {
        if (CONFIG.DEBUG) {
            console.log(`[Tilda Auth] ${message}`, data || '');
        }
    }
    
    // 🔍 ПОИСК ЭЛЕМЕНТА ПО НЕСКОЛЬКИМ СЕЛЕКТОРАМ
    function findElement(selectors) {
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                log(`Найден элемент по селектору: ${selector}`);
                return element;
            }
        }
        return null;
    }
    
    // 📧 ОТПРАВКА ДАННЫХ НА СЕРВЕР
    async function sendLoginRequest(email, password) {
        try {
            log('Отправляем запрос авторизации', { email, password: '***' });
            
            const response = await fetch(`${CONFIG.BACKEND_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                timeout: CONFIG.TIMEOUT
            });
            
            const result = await response.json();
            log('Получен ответ от сервера', result);
            
            return { success: response.ok, data: result };
            
        } catch (error) {
            log('Ошибка при отправке запроса', error);
            return { 
                success: false, 
                data: { 
                    status: 'error', 
                    message: 'Ошибка подключения к серверу' 
                } 
            };
        }
    }
    
    // 🎨 ПОКАЗ УВЕДОМЛЕНИЯ ПОЛЬЗОВАТЕЛЮ
    function showNotification(message, type = 'info') {
        // Удаляем предыдущие уведомления
        const existingNotifications = document.querySelectorAll('.tilda-auth-notification');
        existingNotifications.forEach(n => n.remove());
        
        // Создаем новое уведомление
        const notification = document.createElement('div');
        notification.className = 'tilda-auth-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            max-width: 350px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
            ${type === 'success' ? 'background: linear-gradient(135deg, #28a745, #20c997);' : ''}
            ${type === 'error' ? 'background: linear-gradient(135deg, #dc3545, #e74c3c);' : ''}
            ${type === 'info' ? 'background: linear-gradient(135deg, #007bff, #6610f2);' : ''}
        `;
        
        // Добавляем стили анимации
        if (!document.querySelector('#tilda-auth-styles')) {
            const styles = document.createElement('style');
            styles.id = 'tilda-auth-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    // 🔄 ПЕРЕНАПРАВЛЕНИЕ НА СТРАНИЦУ КАБИНЕТА
    function redirectToCabinet(token, userData = null) {
        // Сохраняем данные в localStorage для страницы кабинета
        try {
            localStorage.setItem('tilda_user_token', token);
            if (userData) {
                localStorage.setItem('tilda_user_data', JSON.stringify(userData));
                localStorage.setItem('tilda_user_email', userData.email);
            }
        } catch (error) {
            log('Ошибка сохранения в localStorage:', error);
        }
        
        // Определяем URL страницы кабинета
        let cabinetUrl;
        
        // Если мы на том же домене, перенаправляем на страницу кабинета Тильды
        if (window.location.hostname.includes('tilda.ws') || 
            window.location.hostname.includes('tilda.cc') ||
            window.location.hostname !== 'localhost') {
            // Перенаправляем на страницу кабинета в Тильде (нужно указать правильный URL)
            cabinetUrl = '/cabinet'; // Замените на реальный URL страницы кабинета в Тильде
        } else {
            // Для тестирования используем наш сервер
            cabinetUrl = `${CONFIG.BACKEND_URL}/cabinet?token=${token}`;
        }
        
        log('Перенаправляем в кабинет', cabinetUrl);
        
        showNotification('✅ Авторизация успешна! Перенаправляем...', 'success');
        
        setTimeout(() => {
            window.location.href = cabinetUrl;
        }, 1500);
    }
    
    // 📋 ОБРАБОТКА ОТПРАВКИ ФОРМЫ
    function handleFormSubmit(event, form) {
        event.preventDefault();
        log('Перехвачена отправка формы');
        
        // Находим поля email и password
        const emailField = findElement(CONFIG.EMAIL_SELECTORS);
        const passwordField = findElement(CONFIG.PASSWORD_SELECTORS);
        
        if (!emailField) {
            log('Поле email не найдено');
            showNotification('❌ Поле email не найдено на форме', 'error');
            return;
        }
        
        const email = emailField.value.trim();
        const password = passwordField ? passwordField.value : '';
        
        if (!email) {
            showNotification('❌ Введите email', 'error');
            emailField.focus();
            return;
        }
        
        // Проверяем формат email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('❌ Введите корректный email', 'error');
            emailField.focus();
            return;
        }
        
        log('Данные формы валидны', { email, hasPassword: !!password });
        
        // Показываем индикатор загрузки
        showNotification('🔄 Проверяем данные...', 'info');
        
        // Отправляем запрос на сервер
        sendLoginRequest(email, password)
            .then(response => {
                if (response.success && response.data.status === 'success') {
                    log('Авторизация успешна', response.data);
                    
                    if (response.data.token) {
                        redirectToCabinet(response.data.token, response.data.user);
                    } else {
                        showNotification('✅ Авторизация успешна!', 'success');
                    }
                } else {
                    log('Ошибка авторизации', response.data);
                    const errorMessage = response.data.message || 'Неизвестная ошибка';
                    showNotification(`❌ ${errorMessage}`, 'error');
                }
            })
            .catch(error => {
                log('Критическая ошибка', error);
                showNotification('❌ Произошла ошибка. Попробуйте позже.', 'error');
            });
    }
    
    // 🎯 ИНИЦИАЛИЗАЦИЯ СКРИПТА
    function initializeScript() {
        log('Инициализация скрипта авторизации');
        
        // Ищем форму на странице
        const form = findElement(CONFIG.FORM_SELECTORS);
        
        if (!form) {
            log('Форма не найдена на странице');
            return;
        }
        
        log('Форма найдена', form);
        
        // Добавляем обработчик отправки формы
        form.addEventListener('submit', (event) => {
            handleFormSubmit(event, form);
        });
        
        log('Обработчик формы установлен');
        
        // Добавляем визуальный индикатор того, что скрипт работает
        if (CONFIG.DEBUG) {
            const indicator = document.createElement('div');
            indicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: rgba(0,123,255,0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-family: monospace;
                z-index: 9999;
                pointer-events: none;
            `;
            indicator.textContent = '🔗 Tilda Auth Active';
            document.body.appendChild(indicator);
            
            // Скрываем индикатор через 3 секунды
            setTimeout(() => indicator.remove(), 3000);
        }
    }
    
    // 🚀 ЗАПУСК СКРИПТА
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeScript);
    } else {
        initializeScript();
    }
    
    // Дополнительная проверка через 1 секунду (на случай динамической загрузки формы)
    setTimeout(initializeScript, 1000);
    
    log('Скрипт интеграции с Тильдой загружен');
    
})();