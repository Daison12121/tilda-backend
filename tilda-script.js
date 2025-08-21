// Скрипт для вставки в Тильду - устойчивый к document.write()
(function() {
    'use strict';
    
    // URL вашего бэкенда на Railway
    const BACKEND_URL = 'https://your-railway-app.railway.app'; // ЗАМЕНИТЕ НА ВАШ URL
    
    // Функция для получения данных пользователя
    async function fetchUserData(email) {
        try {
            const response = await fetch(`${BACKEND_URL}/user?email=${encodeURIComponent(email)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Ошибка при получении данных пользователя:', error);
            return null;
        }
    }
    
    // Функция для отображения данных пользователя
    function displayUserData(userData) {
        // Найдем контейнер для отображения данных
        let container = document.getElementById('user-data-container');
        
        if (!container) {
            // Создаем контейнер, если его нет
            container = document.createElement('div');
            container.id = 'user-data-container';
            container.style.cssText = `
                padding: 20px;
                margin: 20px 0;
                border: 1px solid #ddd;
                border-radius: 8px;
                background-color: #f9f9f9;
            `;
            
            // Вставляем контейнер в подходящее место
            const targetElement = document.querySelector('.t-container') || document.body;
            targetElement.appendChild(container);
        }
        
        if (userData) {
            container.innerHTML = `
                <h3>Личные данные</h3>
                <p><strong>Email:</strong> ${userData.email || 'Не указан'}</p>
                <p><strong>Имя:</strong> ${userData.name || 'Не указано'}</p>
                <p><strong>Телефон:</strong> ${userData.phone || 'Не указан'}</p>
                <p><strong>Дата регистрации:</strong> ${userData.created_at ? new Date(userData.created_at).toLocaleDateString() : 'Не указана'}</p>
            `;
        } else {
            container.innerHTML = `
                <h3>Данные пользователя</h3>
                <p>Не удалось загрузить данные пользователя.</p>
            `;
        }
    }
    
    // Функция для получения email авторизованного пользователя
    function getUserEmail() {
        // Способ 1: Проверяем глобальные переменные Тильды
        if (window.tildaForm && window.tildaForm.userEmail) {
            return window.tildaForm.userEmail;
        }
        
        // Способ 2: Ищем в localStorage
        const userEmail = localStorage.getItem('tilda_user_email') || 
                         localStorage.getItem('user_email') ||
                         sessionStorage.getItem('tilda_user_email');
        if (userEmail) return userEmail;
        
        // Способ 3: Ищем в cookies
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'tilda_user_email' || name === 'user_email') {
                return decodeURIComponent(value);
            }
        }
        
        // Способ 4: Ищем в форме авторизации
        const emailInput = document.querySelector('input[type="email"]');
        if (emailInput && emailInput.value) {
            return emailInput.value;
        }
        
        // Способ 5: Ищем в тексте страницы (если email отображается)
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const pageText = document.body.innerText;
        const emailMatches = pageText.match(emailRegex);
        if (emailMatches && emailMatches.length > 0) {
            return emailMatches[0];
        }
        
        return null;
    }
    
    // Основная функция инициализации
    async function initUserData() {
        console.log('Инициализация загрузки данных пользователя...');
        
        const email = getUserEmail();
        console.log('Найден email:', email);
        
        if (email) {
            const userData = await fetchUserData(email);
            displayUserData(userData);
        } else {
            displayUserData(null);
            console.log('Email пользователя не найден');
        }
    }
    
    // Функция для отслеживания изменений DOM
    function observeChanges() {
        const observer = new MutationObserver(function(mutations) {
            let shouldReinit = false;
            
            mutations.forEach(function(mutation) {
                // Проверяем, не была ли страница полностью перезаписана
                if (mutation.type === 'childList' && mutation.target === document.body) {
                    shouldReinit = true;
                }
            });
            
            if (shouldReinit) {
                console.log('Обнаружены изменения DOM, перезапуск...');
                setTimeout(initUserData, 1000); // Даем время Тильде завершить операации
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        return observer;
    }
    
    // Запуск при загрузке страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initUserData, 500);
            observeChanges();
        });
    } else {
        setTimeout(initUserData, 500);
        observeChanges();
    }
    
    // Дополнительные попытки запуска через интервалы
    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = setInterval(function() {
        attempts++;
        
        if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            return;
        }
        
        const email = getUserEmail();
        if (email && !document.getElementById('user-data-container')) {
            initUserData();
            clearInterval(checkInterval);
        }
    }, 2000);
    
    // Экспортируем функции для ручного вызова
    window.tildaUserData = {
        init: initUserData,
        getUserEmail: getUserEmail,
        fetchUserData: fetchUserData
    };
    
})();