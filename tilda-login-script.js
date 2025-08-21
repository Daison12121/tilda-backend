// Скрипт для формы авторизации в Тильде
// Вставьте этот код в блок "HTML-код" на странице с формой входа

(function() {
    'use strict';
    
    // URL вашего бэкенда на Railway
    const BACKEND_URL = 'https://your-railway-app.railway.app'; // ЗАМЕНИТЕ НА ВАШ URL
    
    // Функция для отправки данных на сервер
    async function loginUser(email) {
        try {
            const response = await fetch(`${BACKEND_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                // Перенаправляем пользователя в личный кабинет
                window.location.href = `${BACKEND_URL}${result.redirect}`;
                return true;
            } else {
                throw new Error(result.error || 'Ошибка авторизации');
            }
        } catch (error) {
            console.error('Ошибка при авторизации:', error);
            throw error;
        }
    }
    
    // Функция для показа сообщений пользователю
    function showMessage(message, isError = false) {
        // Удаляем предыдущие сообщения
        const existingMessages = document.querySelectorAll('.auth-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Создаем новое сообщение
        const messageDiv = document.createElement('div');
        messageDiv.className = 'auth-message';
        messageDiv.style.cssText = `
            padding: 15px;
            margin: 15px 0;
            border-radius: 8px;
            font-weight: 500;
            text-align: center;
            ${isError ? 
                'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;' : 
                'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;'
            }
        `;
        messageDiv.textContent = message;
        
        // Вставляем сообщение перед формой
        const form = document.querySelector('form') || document.querySelector('.t-form');
        if (form) {
            form.parentNode.insertBefore(messageDiv, form);
        } else {
            document.body.appendChild(messageDiv);
        }
        
        // Автоматически скрываем сообщение через 5 секунд
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
    
    // Функция для показа индикатора загрузки
    function showLoading(show = true) {
        const submitButton = document.querySelector('button[type="submit"]') || 
                           document.querySelector('.t-submit') ||
                           document.querySelector('input[type="submit"]');
        
        if (submitButton) {
            if (show) {
                submitButton.disabled = true;
                submitButton.originalText = submitButton.textContent || submitButton.value;
                if (submitButton.tagName === 'INPUT') {
                    submitButton.value = 'Вход...';
                } else {
                    submitButton.textContent = 'Вход...';
                }
            } else {
                submitButton.disabled = false;
                if (submitButton.tagName === 'INPUT') {
                    submitButton.value = submitButton.originalText || 'Войти';
                } else {
                    submitButton.textContent = submitButton.originalText || 'Войти';
                }
            }
        }
    }
    
    // Функция для обработки отправки формы
    async function handleFormSubmit(event) {
        event.preventDefault();
        
        // Получаем email из формы
        const emailInput = event.target.querySelector('input[type="email"]') ||
                          event.target.querySelector('input[name="email"]') ||
                          event.target.querySelector('input[name="Email"]');
        
        if (!emailInput) {
            showMessage('Не найдено поле для ввода email', true);
            return;
        }
        
        const email = emailInput.value.trim();
        
        if (!email) {
            showMessage('Пожалуйста, введите email', true);
            return;
        }
        
        // Простая валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Пожалуйста, введите корректный email', true);
            return;
        }
        
        try {
            showLoading(true);
            showMessage('Проверяем данные...', false);
            
            await loginUser(email);
            
            // Если дошли до этой точки, значит авторизация прошла успешно
            showMessage('Авторизация успешна! Перенаправляем в личный кабинет...', false);
            
        } catch (error) {
            showLoading(false);
            showMessage(error.message || 'Произошла ошибка при входе', true);
        }
    }
    
    // Функция для инициализации обработчиков
    function initFormHandlers() {
        // Ищем все формы на странице
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Проверяем, есть ли в форме поле email
            const emailInput = form.querySelector('input[type="email"]') ||
                              form.querySelector('input[name="email"]') ||
                              form.querySelector('input[name="Email"]');
            
            if (emailInput) {
                // Удаляем предыдущие обработчики
                form.removeEventListener('submit', handleFormSubmit);
                // Добавляем новый обработчик
                form.addEventListener('submit', handleFormSubmit);
                
                console.log('Обработчик формы авторизации подключен');
            }
        });
    }
    
    // Функция для отслеживания изменений DOM
    function observeChanges() {
        const observer = new MutationObserver(function(mutations) {
            let shouldReinit = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    // Проверяем, не появились ли новые формы
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            if (node.tagName === 'FORM' || node.querySelector('form')) {
                                shouldReinit = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldReinit) {
                console.log('Обнаружены новые формы, переинициализация...');
                setTimeout(initFormHandlers, 500);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        return observer;
    }
    
    // Инициализация при загрузке страницы
    function init() {
        console.log('Инициализация скрипта авторизации...');
        
        // Инициализируем обработчики форм
        initFormHandlers();
        
        // Запускаем наблюдение за изменениями DOM
        observeChanges();
        
        // Дополнительная инициализация через интервалы
        let attempts = 0;
        const maxAttempts = 10;
        const checkInterval = setInterval(function() {
            attempts++;
            
            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                return;
            }
            
            const forms = document.querySelectorAll('form');
            let hasEmailForm = false;
            
            forms.forEach(form => {
                const emailInput = form.querySelector('input[type="email"]') ||
                                  form.querySelector('input[name="email"]') ||
                                  form.querySelector('input[name="Email"]');
                if (emailInput) {
                    hasEmailForm = true;
                }
            });
            
            if (hasEmailForm) {
                initFormHandlers();
                clearInterval(checkInterval);
            }
        }, 1000);
    }
    
    // Запуск инициализации
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Экспортируем функции для ручного использования
    window.tildaAuth = {
        init: init,
        loginUser: loginUser,
        initFormHandlers: initFormHandlers
    };
    
})();