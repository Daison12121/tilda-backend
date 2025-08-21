// Простой скрипт для получения данных пользователя в Тильде
// Вставьте этот код в блок "HTML-код" на странице личного кабинета

(function() {
    'use strict';
    
    // URL вашего бэкенда на Railway
    const BACKEND_URL = 'https://your-railway-app.railway.app'; // ЗАМЕНИТЕ НА ВАШ URL
    
    // Функция для получения email авторизованного пользователя в Тильде
    function getTildaUserEmail() {
        // Способ 1: Из глобальных переменных Тильды
        if (window.tildaForm && window.tildaForm.userEmail) {
            return window.tildaForm.userEmail;
        }
        
        if (window.currentUser && window.currentUser.email) {
            return window.currentUser.email;
        }
        
        // Способ 2: Из localStorage (где Тильда может хранить данные пользователя)
        const userEmail = localStorage.getItem('tilda_user_email') || 
                         localStorage.getItem('user_email') ||
                         localStorage.getItem('memberEmail') ||
                         sessionStorage.getItem('tilda_user_email');
        if (userEmail) return userEmail;
        
        // Способ 3: Из cookies
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'tilda_user_email' || name === 'user_email' || name === 'memberEmail') {
                return decodeURIComponent(value);
            }
        }
        
        // Способ 4: Из скрытых полей на странице (если Тильда их создает)
        const hiddenEmailInput = document.querySelector('input[name="email"][type="hidden"]') ||
                                 document.querySelector('input[name="user_email"][type="hidden"]');
        if (hiddenEmailInput && hiddenEmailInput.value) {
            return hiddenEmailInput.value;
        }
        
        // Способ 5: Из текста на странице (если email отображается где-то)
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const pageText = document.body.innerText;
        const emailMatches = pageText.match(emailRegex);
        if (emailMatches && emailMatches.length > 0) {
            // Берем первый найденный email
            return emailMatches[0];
        }
        
        return null;
    }
    
    // Функция для получения данных пользователя с сервера
    async function fetchUserData(email) {
        try {
            console.log('Запрашиваем данные для email:', email);
            
            const response = await fetch(`${BACKEND_URL}/user?email=${encodeURIComponent(email)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Получены данные пользователя:', result);
            
            return result.data;
        } catch (error) {
            console.error('Ошибка при получении данных пользователя:', error);
            return null;
        }
    }
    
    // Функция для отображения данных пользователя на странице
    function displayUserData(userData, email) {
        // Ищем контейнер для данных или создаем его
        let container = document.getElementById('user-data-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'user-data-container';
            container.style.cssText = `
                max-width: 600px;
                margin: 20px auto;
                padding: 30px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            
            // Вставляем контейнер в подходящее место
            const targetElement = document.querySelector('.t-container') || 
                                 document.querySelector('.t-section') || 
                                 document.body;
            targetElement.appendChild(container);
        }
        
        if (userData) {
            container.innerHTML = `
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #333; margin-bottom: 10px;">👋 Добро пожаловать!</h2>
                    <p style="color: #666;">Ваши личные данные</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
                        <strong style="color: #495057; display: block; margin-bottom: 5px;">📧 Email</strong>
                        <span style="color: #212529;">${userData.email || email}</span>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
                        <strong style="color: #495057; display: block; margin-bottom: 5px;">👤 Имя</strong>
                        <span style="color: #212529;">${userData.name || 'Не указано'}</span>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                        <strong style="color: #495057; display: block; margin-bottom: 5px;">📱 Телефон</strong>
                        <span style="color: #212529;">${userData.phone || 'Не указан'}</span>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8;">
                        <strong style="color: #495057; display: block; margin-bottom: 5px;">📅 Дата регистрации</strong>
                        <span style="color: #212529;">${userData.created_at ? new Date(userData.created_at).toLocaleDateString('ru-RU') : 'Не указана'}</span>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <button onclick="window.tildaUserProfile.refresh()" style="
                        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                    ">🔄 Обновить данные</button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #dc3545;">
                    <h3 style="margin-bottom: 15px;">❌ Данные не найдены</h3>
                    <p>Не удалось найти пользователя с email: <strong>${email}</strong></p>
                    <p style="margin-top: 15px; font-size: 14px; color: #6c757d;">
                        Убедитесь, что вы зарегистрированы в системе
                    </p>
                </div>
            `;
        }
    }
    
    // Функция для отображения состояния загрузки
    function showLoading() {
        let container = document.getElementById('user-data-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'user-data-container';
            container.style.cssText = `
                max-width: 600px;
                margin: 20px auto;
                padding: 30px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            
            const targetElement = document.querySelector('.t-container') || 
                                 document.querySelector('.t-section') || 
                                 document.body;
            targetElement.appendChild(container);
        }
        
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #007bff;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <h3 style="color: #333; margin-bottom: 10px;">Загрузка профиля...</h3>
                <p style="color: #666;">Получаем ваши данные</p>
            </div>
            
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }
    
    // Функция для отображения ошибки получения email
    function showEmailNotFound() {
        let container = document.getElementById('user-data-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'user-data-container';
            container.style.cssText = `
                max-width: 600px;
                margin: 20px auto;
                padding: 30px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            
            const targetElement = document.querySelector('.t-container') || 
                                 document.querySelector('.t-section') || 
                                 document.body;
            targetElement.appendChild(container);
        }
        
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #ffc107;">
                <h3 style="margin-bottom: 15px;">⚠️ Пользователь не авторизован</h3>
                <p>Не удалось определить email авторизованного пользователя.</p>
                <p style="margin-top: 15px; font-size: 14px; color: #6c757d;">
                    Убедитесь, что вы вошли в личный кабинет Тильды
                </p>
                <div style="margin-top: 20px;">
                    <button onclick="window.tildaUserProfile.refresh()" style="
                        background: #ffc107;
                        color: #212529;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                    ">🔄 Попробовать снова</button>
                </div>
            </div>
        `;
    }
    
    // Основная функция загрузки данных пользователя
    async function loadUserProfile() {
        console.log('Начинаем загрузку профиля пользователя...');
        
        showLoading();
        
        // Получаем email пользователя
        const email = getTildaUserEmail();
        console.log('Найден email пользователя:', email);
        
        if (!email) {
            console.log('Email пользователя не найден');
            showEmailNotFound();
            return;
        }
        
        // Загружаем данные пользователя
        const userData = await fetchUserData(email);
        
        // Отображаем данные
        displayUserData(userData, email);
    }
    
    // Функция для отслеживания изменений DOM (на случай если Тильда перезагружает страницу)
    function observeChanges() {
        const observer = new MutationObserver(function(mutations) {
            let shouldReload = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.target === document.body) {
                    // Проверяем, не исчез ли наш контейнер
                    if (!document.getElementById('user-data-container')) {
                        shouldReload = true;
                    }
                }
            });
            
            if (shouldReload) {
                console.log('Обнаружены изменения DOM, перезагружаем профиль...');
                setTimeout(loadUserProfile, 1000);
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
        console.log('Инициализация скрипта профиля пользователя...');
        
        // Загружаем профиль с небольшой задержкой
        setTimeout(loadUserProfile, 500);
        
        // Запускаем наблюдение за изменениями DOM
        observeChanges();
        
        // Дополнительные попытки загрузки через интервалы
        let attempts = 0;
        const maxAttempts = 5;
        const checkInterval = setInterval(function() {
            attempts++;
            
            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                return;
            }
            
            // Если контейнер не создан и email найден, пробуем снова
            const email = getTildaUserEmail();
            if (email && !document.getElementById('user-data-container')) {
                console.log(`Попытка ${attempts}: повторная загрузка профиля`);
                loadUserProfile();
            }
            
            if (document.getElementById('user-data-container')) {
                clearInterval(checkInterval);
            }
        }, 2000);
    }
    
    // Запуск инициализации
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Экспортируем функции для ручного использования
    window.tildaUserProfile = {
        load: loadUserProfile,
        refresh: loadUserProfile,
        getEmail: getTildaUserEmail,
        fetchData: fetchUserData
    };
    
    console.log('Скрипт профиля пользователя загружен. Доступные функции:', Object.keys(window.tildaUserProfile));
    
})();