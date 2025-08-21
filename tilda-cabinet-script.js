/**
 * 🏠 СКРИПТ ДЛЯ СТРАНИЦЫ ЛИЧНОГО КАБИНЕТА В ТИЛЬДЕ
 * 
 * Этот скрипт нужно добавить на страницу личного кабинета в Тильде.
 * Он получает данные пользователя через токен из URL или через localStorage.
 * 
 * ИНСТРУКЦИЯ ПО УСТАНОВКЕ:
 * 1. Скопируйте весь этот код
 * 2. В Тильде на странице личного кабинета добавьте блок "HTML-код"
 * 3. Вставьте этот код в блок
 * 4. Сохраните и опубликуйте страницу
 */

(function() {
    'use strict';
    
    // ⚙️ НАСТРОЙКИ
    const CONFIG = {
        // URL вашего бэкенда на Railway
        BACKEND_URL: 'https://tilda-backend-production.up.railway.app',
        
        // Время ожидания ответа от сервера (в миллисекундах)
        TIMEOUT: 10000,
        
        // Показывать ли подробные логи в консоли
        DEBUG: true,
        
        // Ключи для localStorage
        STORAGE_KEYS: {
            USER_DATA: 'tilda_user_data',
            USER_TOKEN: 'tilda_user_token',
            USER_EMAIL: 'tilda_user_email'
        }
    };
    
    // 📝 ФУНКЦИЯ ЛОГИРОВАНИЯ
    function log(message, data = null) {
        if (CONFIG.DEBUG) {
            console.log(`[Tilda Cabinet] ${message}`, data || '');
        }
    }
    
    // 🔍 ПОЛУЧЕНИЕ ПАРАМЕТРА ИЗ URL
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
    
    // 💾 СОХРАНЕНИЕ ДАННЫХ В LOCALSTORAGE И КУКИ
    function saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            log(`Данные сохранены в localStorage: ${key}`);
            
            // Также сохраняем в куки для надежности
            if (typeof data === 'string') {
                setCookie(key, data);
            } else {
                setCookie(key, JSON.stringify(data));
            }
        } catch (error) {
            log(`Ошибка сохранения в localStorage: ${error.message}`);
        }
    }
    
    // 📖 ПОЛУЧЕНИЕ ДАННЫХ ИЗ LOCALSTORAGE
    function getFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            log(`Ошибка чтения из localStorage: ${error.message}`);
            return null;
        }
    }
    
    // 🍪 ПОЛУЧЕНИЕ ЗНАЧЕНИЯ ИЗ КУКИ
    function getCookieValue(name) {
        try {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) {
                return parts.pop().split(';').shift();
            }
        } catch (error) {
            log(`Ошибка чтения куки: ${error.message}`);
        }
        return null;
    }
    
    // 🍪 УСТАНОВКА КУКИ
    function setCookie(name, value, days = 30) {
        try {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
            log(`Куки установлены: ${name}`);
        } catch (error) {
            log(`Ошибка установки куки: ${error.message}`);
        }
    }
    
    // 🔄 ПОЛУЧЕНИЕ ТОКЕНА (ИЗ URL ИЛИ LOCALSTORAGE)
    function getAuthToken() {
        // Сначала проверяем URL
        const urlToken = getUrlParameter('token');
        if (urlToken) {
            log('Токен найден в URL');
            // Сохраняем токен в localStorage для будущих посещений
            saveToStorage(CONFIG.STORAGE_KEYS.USER_TOKEN, urlToken);
            return urlToken;
        }
        
        // Если в URL нет токена, проверяем localStorage
        const storageToken = getFromStorage(CONFIG.STORAGE_KEYS.USER_TOKEN);
        if (storageToken) {
            log('Токен найден в localStorage');
            return storageToken;
        }
        
        log('Токен не найден');
        return null;
    }
    
    // 🔍 ПОЛУЧЕНИЕ АКТУАЛЬНОГО EMAIL ИЗ СИСТЕМЫ ТИЛЬДЫ
    function getCurrentTildaEmail() {
        // Проверяем систему членства Тильды (самый актуальный источник)
        if (window.tildaMembers) {
            log('Проверяем актуального пользователя в tildaMembers:', window.tildaMembers);
            
            // Проверяем методы получения текущего пользователя
            if (typeof window.tildaMembers.getCurrentUser === 'function') {
                try {
                    const currentUser = window.tildaMembers.getCurrentUser();
                    if (currentUser && currentUser.email) {
                        log(`Актуальный email найден через getCurrentUser: ${currentUser.email}`);
                        return currentUser.email;
                    }
                } catch (error) {
                    log('Ошибка при вызове getCurrentUser:', error);
                }
            }
            
            // Проверяем разные варианты структуры данных
            const memberSources = [
                window.tildaMembers.currentUser,
                window.tildaMembers.user,
                window.tildaMembers.member
            ];
            
            for (const source of memberSources) {
                if (source && source.email) {
                    log(`Актуальный email найден в tildaMembers: ${source.email}`);
                    return source.email;
                }
            }
        }
        
        // Проверяем глобальные переменные
        if (window.currentUser && window.currentUser.email) {
            log(`Актуальный email найден в currentUser: ${window.currentUser.email}`);
            return window.currentUser.email;
        }
        
        if (window.tildaForm && window.tildaForm.userEmail) {
            log(`Актуальный email найден в tildaForm: ${window.tildaForm.userEmail}`);
            return window.tildaForm.userEmail;
        }
        
        return null;
    }
    
    // 📧 ПОЛУЧЕНИЕ EMAIL ПОЛЬЗОВАТЕЛЯ
    function getUserEmail() {
        // Проверяем URL параметр (высший приоритет)
        const urlEmail = getUrlParameter('email');
        if (urlEmail) {
            log('Email найден в URL');
            saveToStorage(CONFIG.STORAGE_KEYS.USER_EMAIL, urlEmail);
            return urlEmail;
        }
        
        // Получаем актуальный email из системы Тильды
        const currentEmail = getCurrentTildaEmail();
        if (currentEmail) {
            // Обновляем кэш с актуальными данными
            saveToStorage(CONFIG.STORAGE_KEYS.USER_EMAIL, currentEmail);
            return currentEmail;
        }
        
        // Проверяем куки (разные варианты имен)
        const cookieNames = ['tilda_user_email', 'userEmail', 'user_email', 'email'];
        for (const cookieName of cookieNames) {
            const cookieEmail = getCookieValue(cookieName);
            if (cookieEmail) {
                log(`Email найден в куки ${cookieName}: ${cookieEmail}`);
                // Декодируем URL-кодированный email
                const decodedEmail = decodeURIComponent(cookieEmail);
                saveToStorage(CONFIG.STORAGE_KEYS.USER_EMAIL, decodedEmail);
                return decodedEmail;
            }
        }
        
        // В последнюю очередь проверяем localStorage (может быть устаревшим)
        const storageEmail = getFromStorage(CONFIG.STORAGE_KEYS.USER_EMAIL);
        if (storageEmail) {
            log('Email найден в localStorage (может быть устаревшим)');
            return storageEmail;
        }
        
        log('Email не найден');
        return null;
    }
    
    // 🌐 ПОЛУЧЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ С СЕРВЕРА
    async function fetchUserData(token = null, email = null) {
        try {
            let url = `${CONFIG.BACKEND_URL}`;
            
            if (token) {
                // Если есть токен, используем эндпоинт с токеном
                url += `/api/user?token=${encodeURIComponent(token)}`;
                log('Запрашиваем данные по токену');
            } else if (email) {
                // Если есть email, используем простой эндпоинт
                url += `/user?email=${encodeURIComponent(email)}`;
                log('Запрашиваем данные по email');
            } else {
                throw new Error('Нет ни токена, ни email для запроса');
            }
            
            log('Отправляем запрос:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            log('Получены данные пользователя:', result);
            
            const userData = result.data || result;
            
            // Сохраняем данные в localStorage
            saveToStorage(CONFIG.STORAGE_KEYS.USER_DATA, userData);
            if (userData.email) {
                saveToStorage(CONFIG.STORAGE_KEYS.USER_EMAIL, userData.email);
            }
            
            return userData;
            
        } catch (error) {
            log('Ошибка при получении данных пользователя:', error);
            throw error;
        }
    }
    
    // 🎨 ОТОБРАЖЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ НА СТРАНИЦЕ
    function displayUserData(userData) {
        // Ищем контейнер для данных или создаем его
        let container = document.getElementById('user-data-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'user-data-container';
            container.style.cssText = `
                max-width: 800px;
                margin: 20px auto;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            
            // Вставляем контейнер в подходящее место
            const targetElement = document.querySelector('.t-container') || 
                                 document.querySelector('.t-section') || 
                                 document.querySelector('.t-col') ||
                                 document.body;
            targetElement.appendChild(container);
        }
        
        if (userData) {
            container.innerHTML = `
                <!-- Приветственное сообщение -->
                <div style="
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    color: white;
                    padding: 25px;
                    border-radius: 15px;
                    margin-bottom: 25px;
                    text-align: center;
                    box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
                ">
                    <h2 style="margin: 0 0 10px 0; font-size: 1.8rem; font-weight: 500;">
                        👋 Добро пожаловать, ${userData.name || 'Пользователь'}!
                    </h2>
                    <p style="margin: 0; opacity: 0.9; font-size: 1.1rem;">
                        Рады видеть вас в личном кабинете
                    </p>
                </div>
                
                <!-- Основная карточка с данными -->
                <div style="
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    overflow: hidden;
                    margin-bottom: 25px;
                ">
                    <!-- Заголовок карточки -->
                    <div style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 25px;
                        text-align: center;
                    ">
                        <h3 style="margin: 0; font-size: 1.5rem; font-weight: 500;">
                            📋 Личная информация
                        </h3>
                    </div>
                    
                    <!-- Содержимое карточки -->
                    <div style="padding: 30px;">
                        <!-- Сетка с данными -->
                        <div style="
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                            gap: 20px;
                            margin-bottom: 25px;
                        ">
                            <div style="
                                background: #f8f9fa;
                                padding: 20px;
                                border-radius: 12px;
                                border-left: 4px solid #007bff;
                                transition: transform 0.2s ease;
                            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                <strong style="color: #495057; display: block; margin-bottom: 8px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">
                                    📧 Email
                                </strong>
                                <span style="color: #212529; font-size: 1.1rem; font-weight: 500;">
                                    ${userData.email || 'Не указан'}
                                </span>
                            </div>
                            
                            <div style="
                                background: #f8f9fa;
                                padding: 20px;
                                border-radius: 12px;
                                border-left: 4px solid #28a745;
                                transition: transform 0.2s ease;
                            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                <strong style="color: #495057; display: block; margin-bottom: 8px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">
                                    👤 Имя
                                </strong>
                                <span style="color: #212529; font-size: 1.1rem; font-weight: 500;">
                                    ${userData.name || 'Не указано'}
                                </span>
                            </div>
                            
                            <div style="
                                background: #f8f9fa;
                                padding: 20px;
                                border-radius: 12px;
                                border-left: 4px solid #ffc107;
                                transition: transform 0.2s ease;
                            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                <strong style="color: #495057; display: block; margin-bottom: 8px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">
                                    🎯 ID пользователя
                                </strong>
                                <span style="color: #212529; font-family: monospace; font-size: 0.9rem; word-break: break-all;">
                                    ${userData.id || 'Не указан'}
                                </span>
                            </div>
                            
                            <div style="
                                background: #f8f9fa;
                                padding: 20px;
                                border-radius: 12px;
                                border-left: 4px solid #17a2b8;
                                transition: transform 0.2s ease;
                            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                <strong style="color: #495057; display: block; margin-bottom: 8px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">
                                    📅 Дата регистрации
                                </strong>
                                <span style="color: #212529; font-size: 1.1rem; font-weight: 500;">
                                    ${userData.created_at ? new Date(userData.created_at).toLocaleDateString('ru-RU', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'Не указана'}
                                </span>
                            </div>
                        </div>
                        
                        <!-- Статистика -->
                        <div style="
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                            gap: 15px;
                            margin-bottom: 25px;
                        ">
                            <div style="
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                padding: 20px;
                                border-radius: 12px;
                                text-align: center;
                            ">
                                <div style="font-size: 1.8rem; font-weight: bold; margin-bottom: 5px;">
                                    ${userData.created_at ? Math.ceil((new Date() - new Date(userData.created_at)) / (1000 * 60 * 60 * 24)) : 0}
                                </div>
                                <div style="font-size: 0.9rem; opacity: 0.9;">дней с нами</div>
                            </div>
                            
                            <div style="
                                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                                color: white;
                                padding: 20px;
                                border-radius: 12px;
                                text-align: center;
                            ">
                                <div style="font-size: 1.8rem; font-weight: bold; margin-bottom: 5px;">✅</div>
                                <div style="font-size: 0.9rem; opacity: 0.9;">профиль активен</div>
                            </div>
                            
                            <div style="
                                background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%);
                                color: white;
                                padding: 20px;
                                border-radius: 12px;
                                text-align: center;
                            ">
                                <div style="font-size: 1.8rem; font-weight: bold; margin-bottom: 5px;">🔒</div>
                                <div style="font-size: 0.9rem; opacity: 0.9;">данные защищены</div>
                            </div>
                        </div>
                        
                        <!-- Кнопки действий -->
                        <div style="text-align: center;">
                            <button onclick="window.tildaCabinet.refresh()" style="
                                background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                                color: white;
                                border: none;
                                padding: 12px 25px;
                                border-radius: 25px;
                                cursor: pointer;
                                font-size: 14px;
                                font-weight: 500;
                                margin: 0 10px;
                                transition: transform 0.2s ease;
                            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                🔄 Обновить данные
                            </button>
                            
                            <button onclick="window.tildaCabinet.logout()" style="
                                background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
                                color: white;
                                border: none;
                                padding: 12px 25px;
                                border-radius: 25px;
                                cursor: pointer;
                                font-size: 14px;
                                font-weight: 500;
                                margin: 0 10px;
                                transition: transform 0.2s ease;
                            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                🚪 Выйти
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 15px;
                    padding: 40px;
                    text-align: center;
                    color: #dc3545;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                ">
                    <h3 style="margin-bottom: 15px; font-size: 1.5rem;">❌ Данные не найдены</h3>
                    <p style="margin-bottom: 20px;">Не удалось загрузить информацию о пользователе</p>
                    <button onclick="window.tildaCabinet.refresh()" style="
                        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                    ">
                        🔄 Попробовать снова
                    </button>
                </div>
            `;
        }
    }
    
    // ⏳ ОТОБРАЖЕНИЕ СОСТОЯНИЯ ЗАГРУЗКИ
    function showLoading() {
        let container = document.getElementById('user-data-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'user-data-container';
            container.style.cssText = `
                max-width: 800px;
                margin: 20px auto;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            
            const targetElement = document.querySelector('.t-container') || 
                                 document.querySelector('.t-section') || 
                                 document.querySelector('.t-col') ||
                                 document.body;
            targetElement.appendChild(container);
        }
        
        container.innerHTML = `
            <div style="
                background: white;
                border-radius: 15px;
                padding: 50px;
                text-align: center;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            ">
                <div style="
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #007bff;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <h3 style="color: #333; margin-bottom: 10px; font-size: 1.5rem;">Загрузка профиля...</h3>
                <p style="color: #666; margin: 0;">Получаем ваши данные</p>
            </div>
            
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }
    
    // ❌ ОТОБРАЖЕНИЕ ОШИБКИ АВТОРИЗАЦИИ
    function showAuthError() {
        let container = document.getElementById('user-data-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'user-data-container';
            container.style.cssText = `
                max-width: 800px;
                margin: 20px auto;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            
            const targetElement = document.querySelector('.t-container') || 
                                 document.querySelector('.t-section') || 
                                 document.querySelector('.t-col') ||
                                 document.body;
            targetElement.appendChild(container);
        }
        
        container.innerHTML = `
            <div style="
                background: white;
                border-radius: 15px;
                padding: 40px;
                text-align: center;
                color: #ffc107;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            ">
                <h3 style="margin-bottom: 15px; font-size: 1.5rem;">⚠️ Требуется авторизация</h3>
                <p style="margin-bottom: 20px;">Для доступа к личному кабинету необходимо войти в систему</p>
                <p style="margin-bottom: 20px; font-size: 14px; color: #666;">
                    ${window.location.pathname === '/cabinet' ? 'Через 2 секунды вы будете перенаправлены на страницу авторизации...' : ''}
                </p>
                <div style="margin-bottom: 20px;">
                    <button onclick="window.tildaCabinet.forceRefresh()" style="
                        background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
                        color: #212529;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        margin: 0 5px;
                    ">
                        🔄 Обновить данные
                    </button>
                    <button onclick="window.location.href='/members/login'" style="
                        background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        margin: 0 5px;
                    ">
                        🔑 Войти в систему
                    </button>
                    <button onclick="window.tildaCabinet.testLogin()" style="
                        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        margin: 0 5px;
                    ">
                        🧪 Тест с демо-данными
                    </button>
                </div>
                <details style="text-align: left; margin-top: 20px; font-size: 12px; color: #666;">
                    <summary style="cursor: pointer; margin-bottom: 10px;">🔍 Отладочная информация</summary>
                    <div id="debug-auth-info">
                        <div><strong>URL:</strong> ${window.location.href}</div>
                        <div><strong>localStorage токен:</strong> ${localStorage.getItem('tilda_user_token') || 'Нет'}</div>
                        <div><strong>localStorage email:</strong> ${localStorage.getItem('tilda_user_email') || 'Нет'}</div>
                        <div><strong>Куки:</strong> ${document.cookie || 'Нет'}</div>
                        <div><strong>URL параметры:</strong> ${window.location.search || 'Нет'}</div>
                    </div>
                </details>
            </div>
        `;
    }
    
    // 🔄 ОБНОВЛЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ
    async function refreshUserData() {
        log('Обновление данных пользователя...');
        showLoading();
        
        try {
            const token = getAuthToken();
            const email = getUserEmail();
            
            if (!token && !email) {
                log('Нет данных для авторизации');
                
                // Проверяем, есть ли параметр для автоматического перенаправления
                const urlParams = new URLSearchParams(window.location.search);
                const autoRedirect = urlParams.get('redirect') !== 'false';
                
                if (autoRedirect && window.location.pathname === '/cabinet') {
                    log('Автоматическое перенаправление на страницу входа...');
                    // Добавляем задержку для показа сообщения
                    setTimeout(() => {
                        window.location.href = '/members/login?redirect=' + encodeURIComponent(window.location.href);
                    }, 2000);
                }
                
                showAuthError();
                return;
            }
            
            let userData = null;
            
            // Пробуем с токеном, потом с email
            if (token) {
                try {
                    log('Пробуем запрос с токеном...');
                    userData = await fetchUserData(token, null);
                    log('Данные получены по токену');
                } catch (error) {
                    log('Ошибка при запросе с токеном:', error.message);
                    
                    if (email) {
                        log('Пробуем запрос по email...');
                        userData = await fetchUserData(null, email);
                        log('Данные получены по email');
                    } else {
                        throw error;
                    }
                }
            } else if (email) {
                log('Запрашиваем данные только по email...');
                userData = await fetchUserData(null, email);
            }
            
            displayUserData(userData);
            
        } catch (error) {
            log('Ошибка при обновлении данных:', error);
            displayUserData(null);
        }
    }
    
    // 🚪 ВЫХОД ИЗ СИСТЕМЫ
    function logout() {
        log('Выход из системы');
        
        // Очищаем localStorage
        Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Очищаем куки
        const cookieNames = ['tilda_user_email', 'tilda_user_token', 'tilda_user_data'];
        cookieNames.forEach(name => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        
        // Показываем сообщение
        showAuthError();
        
        // Можно перенаправить на страницу входа
        // window.location.href = '/login';
    }
    
    // 🔄 ЗАГРУЗКА ДАННЫХ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
    async function loadCurrentUserData(token, email) {
        let userData = null;
        
        // Пробуем с токеном, потом с email
        if (token) {
            try {
                log('Пробуем запрос с токеном...');
                userData = await fetchUserData(token, null);
                log('Данные получены по токену');
            } catch (error) {
                log('Ошибка при запросе с токеном:', error.message);
                
                if (email) {
                    log('Пробуем запрос по email...');
                    userData = await fetchUserData(null, email);
                    log('Данные получены по email');
                } else {
                    throw error;
                }
            }
        } else if (email) {
            log('Запрашиваем данные только по email...');
            userData = await fetchUserData(null, email);
        }
        
        return userData;
    }
    
    // 🔄 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ
    function forceRefreshUserData() {
        log('Принудительное обновление данных пользователя...');
        
        // Очищаем кэш
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_EMAIL);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_TOKEN);
        
        // Перезагружаем профиль
        loadUserProfile();
    }
    
    // 🎯 ОСНОВНАЯ ФУНКЦИЯ ЗАГРУЗКИ ПРОФИЛЯ
    async function loadUserProfile() {
        log('Начинаем загрузку профиля пользователя...');
        
        // Подробная отладочная информация
        log('=== ОТЛАДОЧНАЯ ИНФОРМАЦИЯ ===');
        log('URL:', window.location.href);
        log('URL параметры:', window.location.search);
        log('localStorage содержимое:', {
            token: localStorage.getItem(CONFIG.STORAGE_KEYS.USER_TOKEN),
            email: localStorage.getItem(CONFIG.STORAGE_KEYS.USER_EMAIL),
            userData: localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA)
        });
        log('Куки:', document.cookie);
        log('Глобальные переменные Тильды:', {
            tildaForm: !!window.tildaForm,
            currentUser: !!window.currentUser,
            tildaMembers: !!window.tildaMembers
        });
        log('==============================');
        
        showLoading();
        
        try {
            // Получаем токен и email
            const token = getAuthToken();
            const email = getUserEmail();
            
            log('Найденные данные авторизации:', { 
                hasToken: !!token, 
                hasEmail: !!email,
                token: token ? token.substring(0, 20) + '...' : null,
                email: email
            });
            
            if (!token && !email) {
                log('Нет данных для авторизации');
                
                // Проверяем, есть ли параметр для автоматического перенаправления
                const urlParams = new URLSearchParams(window.location.search);
                const autoRedirect = urlParams.get('redirect') !== 'false';
                
                if (autoRedirect && window.location.pathname === '/cabinet') {
                    log('Автоматическое перенаправление на страницу входа...');
                    // Добавляем задержку для показа сообщения
                    setTimeout(() => {
                        window.location.href = '/members/login?redirect=' + encodeURIComponent(window.location.href);
                    }, 2000);
                }
                
                showAuthError();
                return;
            }
            
            // Пытаемся загрузить данные из localStorage
            const cachedData = getFromStorage(CONFIG.STORAGE_KEYS.USER_DATA);
            if (cachedData && cachedData.email) {
                // Проверяем, соответствуют ли кэшированные данные текущему пользователю
                const currentEmail = email || getUserEmail();
                if (currentEmail && cachedData.email === currentEmail) {
                    log('Найдены кэшированные данные текущего пользователя');
                    displayUserData(cachedData);
                } else {
                    log(`Кэшированные данные принадлежат другому пользователю (${cachedData.email} != ${currentEmail}), очищаем кэш`);
                    // Очищаем кэш другого пользователя
                    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
                    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_TOKEN);
                    
                    // Если есть данные текущего пользователя, загружаем их
                    if (currentEmail || token) {
                        const userData = await loadCurrentUserData(token, currentEmail);
                        displayUserData(userData);
                    } else {
                        showAuthError();
                    }
                    return;
                }
                
                // Обновляем данные в фоне
                setTimeout(async () => {
                    try {
                        let userData = null;
                        
                        // Пробуем с токеном, потом с email
                        if (token) {
                            try {
                                userData = await fetchUserData(token, null);
                            } catch (error) {
                                if (email) {
                                    userData = await fetchUserData(null, email);
                                }
                            }
                        } else if (email) {
                            userData = await fetchUserData(null, email);
                        }
                        
                        if (userData && JSON.stringify(userData) !== JSON.stringify(cachedData)) {
                            log('Данные обновились, перерисовываем');
                            displayUserData(userData);
                        }
                    } catch (error) {
                        log('Ошибка фонового обновления:', error);
                    }
                }, 1000);
                
                return;
            }
            
            // Загружаем данные с сервера
            let userData = null;
            
            // Сначала пробуем запрос с токеном (если есть)
            if (token) {
                try {
                    log('Пробуем запрос с токеном...');
                    userData = await fetchUserData(token, null);
                    log('Данные получены по токену');
                } catch (error) {
                    log('Ошибка при запросе с токеном:', error.message);
                    
                    // Если токен не работает, пробуем по email
                    if (email) {
                        log('Пробуем запрос по email...');
                        try {
                            userData = await fetchUserData(null, email);
                            log('Данные получены по email');
                        } catch (emailError) {
                            log('Ошибка при запросе по email:', emailError.message);
                            throw emailError;
                        }
                    } else {
                        throw error;
                    }
                }
            } else if (email) {
                // Если токена нет, но есть email
                log('Запрашиваем данные только по email...');
                userData = await fetchUserData(null, email);
            }
            
            displayUserData(userData);
            
        } catch (error) {
            log('Ошибка при загрузке профиля:', error);
            displayUserData(null);
        }
    }
    
    // 🚀 ИНИЦИАЛИЗАЦИЯ СКРИПТА
    function initializeCabinet() {
        log('Инициализация скрипта личного кабинета');
        
        // 🧪 ТЕСТОВАЯ ФУНКЦИЯ ДЛЯ ДЕМОНСТРАЦИИ
        function testLogin() {
            log('Запуск тестового входа с демо-данными');
            
            // Устанавливаем тестовые данные
            const testEmail = 'barbarosgroup2024@gmail.com';
            const testToken = 'cd0a2d8fc0cac7e5baf197eac40fff1b7417dcc7fd8bc92a559de709f20991fa';
            
            saveToStorage(CONFIG.STORAGE_KEYS.USER_EMAIL, testEmail);
            saveToStorage(CONFIG.STORAGE_KEYS.USER_TOKEN, testToken);
            
            // Перезагружаем профиль
            refreshUserData();
        }
        
        // Создаем глобальный объект для управления кабинетом
        window.tildaCabinet = {
            load: loadUserProfile,
            refresh: refreshUserData,
            forceRefresh: forceRefreshUserData,
            logout: logout,
            getToken: getAuthToken,
            getEmail: getUserEmail,
            fetchData: fetchUserData,
            testLogin: testLogin
        };
        
        // Загружаем профиль с небольшой задержкой
        setTimeout(loadUserProfile, 500);
        
        log('Скрипт личного кабинета инициализирован');
        log('Доступные функции:', Object.keys(window.tildaCabinet));
    }
    
    // 🎬 ЗАПУСК СКРИПТА
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCabinet);
    } else {
        initializeCabinet();
    }
    
    // Дополнительная проверка через 1 секунду (на случай динамической загрузки)
    setTimeout(initializeCabinet, 1000);
    
    log('Скрипт личного кабинета для Тильды загружен');
    
})();