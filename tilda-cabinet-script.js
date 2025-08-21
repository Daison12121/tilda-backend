/**
 * 🏠 УПРОЩЕННЫЙ СКРИПТ ДЛЯ СТРАНИЦЫ ЛИЧНОГО КАБИНЕТА В ТИЛЬДЕ
 * 
 * Простая интеграция: получаем email из Тильды → запрашиваем данные из API
 */

(function() {
    'use strict';
    
    // ⚙️ НАСТРОЙКИ
    const CONFIG = {
        BACKEND_URL: 'https://tilda-backend-production.up.railway.app',
        DEBUG: true
    };
    
    // 📝 ФУНКЦИЯ ЛОГИРОВАНИЯ
    function log(message, data = null) {
        if (CONFIG.DEBUG) {
            console.log(`[Tilda Cabinet] ${message}`, data || '');
        }
    }
    
    // 🔍 ПОЛУЧЕНИЕ EMAIL ИЗ СИСТЕМЫ ТИЛЬДЫ
    function getTildaUserEmail() {
        log('=== ПОЛНАЯ ДИАГНОСТИКА ВСЕХ ИСТОЧНИКОВ ДАННЫХ ===');
        
        // Проверяем ВСЕ глобальные переменные window
        log('=== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ WINDOW ===');
        const windowVars = ['tildaMembers', 'currentUser', 'tildaForm', 'user', 'member', 'tildaUser', 'userData'];
        windowVars.forEach(varName => {
            if (window[varName]) {
                log(`window.${varName}:`, window[varName]);
                if (window[varName].email) {
                    log(`НАЙДЕН EMAIL в window.${varName}: ${window[varName].email}`);
                }
            } else {
                log(`window.${varName}: не существует`);
            }
        });
        
        // Проверяем tildaMembers подробно
        if (window.tildaMembers) {
            log('=== ДЕТАЛЬНАЯ ПРОВЕРКА tildaMembers ===');
            log('tildaMembers полная структура:', window.tildaMembers);
            
            // Проверяем все методы
            const methods = Object.getOwnPropertyNames(window.tildaMembers);
            log('Доступные методы tildaMembers:', methods);
            
            methods.forEach(method => {
                if (typeof window.tildaMembers[method] === 'function') {
                    log(`Метод ${method} - это функция`);
                    try {
                        const result = window.tildaMembers[method]();
                        log(`Результат ${method}():`, result);
                        if (result && result.email) {
                            log(`НАЙДЕН EMAIL через ${method}(): ${result.email}`);
                        }
                    } catch (error) {
                        log(`Ошибка при вызове ${method}():`, error);
                    }
                } else {
                    log(`Свойство ${method}:`, window.tildaMembers[method]);
                    if (window.tildaMembers[method] && window.tildaMembers[method].email) {
                        log(`НАЙДЕН EMAIL в ${method}: ${window.tildaMembers[method].email}`);
                    }
                }
            });
        }
        
        // Проверяем DOM элементы с данными пользователя
        log('=== ПРОВЕРКА DOM ЭЛЕМЕНТОВ ===');
        const selectors = [
            '[data-user-email]',
            '[data-email]',
            '.user-email',
            '.current-user',
            '#user-email',
            '.member-email'
        ];
        
        selectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                log(`Найден элемент ${selector}:`, element);
                log(`Содержимое:`, element.textContent);
                log(`Атрибуты:`, element.attributes);
            }
        });
        
        // Проверяем localStorage
        log('=== ПРОВЕРКА LOCALSTORAGE ===');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.includes('user') || key.includes('email') || key.includes('tilda')) {
                const value = localStorage.getItem(key);
                log(`localStorage ${key}:`, value);
                try {
                    const parsed = JSON.parse(value);
                    if (parsed.email) {
                        log(`НАЙДЕН EMAIL в localStorage ${key}: ${parsed.email}`);
                    }
                } catch (e) {
                    // Не JSON
                }
            }
        }
        
        // Проверяем sessionStorage
        log('=== ПРОВЕРКА SESSIONSTORAGE ===');
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key.includes('user') || key.includes('email') || key.includes('tilda')) {
                const value = sessionStorage.getItem(key);
                log(`sessionStorage ${key}:`, value);
                try {
                    const parsed = JSON.parse(value);
                    if (parsed.email) {
                        log(`НАЙДЕН EMAIL в sessionStorage ${key}: ${parsed.email}`);
                    }
                } catch (e) {
                    // Не JSON
                }
            }
        }
        
        // Проверяем все куки подробно
        log('=== ДЕТАЛЬНАЯ ПРОВЕРКА ВСЕХ КУКИ ===');
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            log(`Кука ${name}:`, decodeURIComponent(value || ''));
            
            if (name.includes('email') || name.includes('user') || name.includes('tilda')) {
                try {
                    const decoded = decodeURIComponent(value || '');
                    log(`Декодированная кука ${name}:`, decoded);
                    
                    // Пытаемся парсить как JSON
                    try {
                        const parsed = JSON.parse(decoded);
                        log(`Парсированная кука ${name}:`, parsed);
                        if (parsed.email) {
                            log(`НАЙДЕН EMAIL в куке ${name}: ${parsed.email}`);
                        }
                    } catch (e) {
                        // Не JSON, проверяем как обычный email
                        if (decoded.includes('@')) {
                            log(`ВОЗМОЖНЫЙ EMAIL в куке ${name}: ${decoded}`);
                        }
                    }
                } catch (e) {
                    log(`Ошибка декодирования куки ${name}:`, e);
                }
            }
        });
        
        log('=== КОНЕЦ ДИАГНОСТИКИ ===');
        log('ВНИМАНИЕ: Проверьте логи выше и найдите строки с "НАЙДЕН EMAIL"');
        
        return null; // Пока возвращаем null, чтобы увидеть всю диагностику
    }
    
    // 🌐 ПОЛУЧЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ С СЕРВЕРА
    async function fetchUserData(email) {
        try {
            const url = `${CONFIG.BACKEND_URL}/user?email=${encodeURIComponent(email)}`;
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
            
            return result.data || result;
            
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
                                    🆔 ID пользователя
                                </strong>
                                <span style="color: #212529; font-size: 1.1rem; font-weight: 500; font-family: monospace;">
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
                    </div>
                </div>
                
                <!-- Статистика -->
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 25px;
                ">
                    <div style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 25px;
                        border-radius: 15px;
                        text-align: center;
                        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                    ">
                        <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">
                            ${Math.floor((Date.now() - new Date(userData.created_at || Date.now())) / (1000 * 60 * 60 * 24)) || '?'}
                        </div>
                        <div style="opacity: 0.9;">дней с нами</div>
                    </div>
                    
                    <div style="
                        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                        color: white;
                        padding: 25px;
                        border-radius: 15px;
                        text-align: center;
                        box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
                    ">
                        <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">
                            ✅
                        </div>
                        <div style="opacity: 0.9;">профиль активен</div>
                    </div>
                    
                    <div style="
                        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                        color: white;
                        padding: 25px;
                        border-radius: 15px;
                        text-align: center;
                        box-shadow: 0 8px 25px rgba(250, 112, 154, 0.3);
                    ">
                        <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">
                            🔒
                        </div>
                        <div style="opacity: 0.9;">данные защищены</div>
                    </div>
                </div>
                
                <!-- Кнопка обновления -->
                <div style="text-align: center; margin-top: 30px;">
                    <button onclick="window.tildaCabinet.refresh()" style="
                        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: 500;
                        box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
                        transition: transform 0.2s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        🔄 Обновить данные
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 15px;
                    padding: 40px;
                    text-align: center;
                    color: #ffc107;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                ">
                    <h3 style="margin-bottom: 15px; font-size: 1.5rem;">⚠️ Не удалось найти данные пользователя</h3>
                    <p style="margin-bottom: 20px;">Скрипт не может найти email в системе Тильды. Проверьте консоль для диагностики.</p>
                    <div style="margin-bottom: 20px;">
                        <button onclick="window.tildaCabinet.refresh()" style="
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
                            🔄 Попробовать снова
                        </button>
                        <button onclick="window.tildaCabinet.testWithEmail('shoppingalanya@gmail.com')" style="
                            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                            color: white;
                            border: none;
                            padding: 12px 25px;
                            border-radius: 25px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            margin: 0 5px;
                        ">
                            🧪 Тест с shoppingalanya@gmail.com
                        </button>
                        <button onclick="window.tildaCabinet.clearCache()" style="
                            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                            color: white;
                            border: none;
                            padding: 12px 25px;
                            border-radius: 25px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            margin: 0 5px;
                        ">
                            🗑️ Очистить кэш Тильды
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    // ⏳ ОЖИДАНИЕ ЗАГРУЗКИ ДАННЫХ ТИЛЬДЫ
    async function waitForTildaData(maxWaitTime = 3000) {
        const startTime = Date.now();
        let attempts = 0;
        const maxAttempts = 15; // максимум 15 попыток
        
        while (Date.now() - startTime < maxWaitTime && attempts < maxAttempts) {
            attempts++;
            log(`Попытка ${attempts}/${maxAttempts} получить email из Тильды...`);
            
            const email = getTildaUserEmail();
            if (email) {
                log(`Данные Тильды загружены: ${email}`);
                return email;
            }
            
            // Ждем 200мс перед следующей проверкой
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        log(`Время ожидания данных Тильды истекло после ${attempts} попыток`);
        return null;
    }
    
    // 🎯 ОСНОВНАЯ ФУНКЦИЯ ЗАГРУЗКИ ПРОФИЛЯ
    async function loadUserProfile() {
        log('Начинаем загрузку профиля пользователя...');
        
        try {
            // Ждем загрузки данных Тильды
            log('Ожидаем загрузки данных пользователя из системы Тильды...');
            const email = await waitForTildaData();
            
            if (!email) {
                log('Не удалось получить email из системы Тильды');
                
                // Показываем сообщение с диагностикой
                displayUserData(null);
                
                // НЕ перенаправляем автоматически, даем пользователю время разобраться
                log('Автоматическое перенаправление отключено для диагностики');
                return;
            }
            
            log(`Получен email из Тильды: ${email}`);
            
            // Запрашиваем данные с сервера
            const userData = await fetchUserData(email);
            
            if (userData) {
                log('Данные получены успешно');
                displayUserData(userData);
            } else {
                log('Не удалось получить данные пользователя');
                displayUserData(null);
            }
            
        } catch (error) {
            log('Ошибка при загрузке профиля:', error);
            displayUserData(null);
        }
    }
    
    // 🚀 ИНИЦИАЛИЗАЦИЯ СКРИПТА
    function initializeCabinet() {
        log('Инициализация упрощенного скрипта личного кабинета');
        
        // Функция тестирования с конкретным email
        async function testWithEmail(email) {
            log(`Тестируем с email: ${email}`);
            try {
                const userData = await fetchUserData(email);
                if (userData) {
                    displayUserData(userData);
                } else {
                    log('Не удалось получить данные для тестового email');
                }
            } catch (error) {
                log('Ошибка при тестировании:', error);
            }
        }
        
        // Функция очистки старых данных Тильды
        function clearTildaCache() {
            log('Очищаем кэш данных Тильды...');
            
            // Очищаем куки Тильды
            const cookiesToClear = ['tilda_user_email', 'tilda_user_data', 'tilda_user_token'];
            cookiesToClear.forEach(cookieName => {
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                log(`Очищена кука: ${cookieName}`);
            });
            
            // Очищаем localStorage
            const localStorageKeys = ['tilda_user_email', 'tilda_user_data', 'tilda_user_token'];
            localStorageKeys.forEach(key => {
                if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                    log(`Очищен localStorage: ${key}`);
                }
            });
            
            log('Кэш очищен, перезагружаем страницу...');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
        
        // Создаем глобальный объект для управления кабинетом
        window.tildaCabinet = {
            refresh: loadUserProfile,
            getEmail: getTildaUserEmail,
            testWithEmail: testWithEmail,
            clearCache: clearTildaCache
        };
        
        // Загружаем профиль с задержкой
        setTimeout(loadUserProfile, 1000);
        
        log('Скрипт инициализирован');
    }
    
    // 🎬 ЗАПУСК СКРИПТА
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCabinet);
    } else {
        initializeCabinet();
    }
    
    log('Упрощенный скрипт личного кабинета для Тильды загружен');
    
})();