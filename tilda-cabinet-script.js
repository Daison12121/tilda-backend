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
    
    // 🔍 ПОИСК COLLABZA SDK И ТОКЕНОВ
    function getTildaUserEmail() {
        log('=== ПОИСК COLLABZA SDK И СИСТЕМЫ СЕССИЙ ===');
        
        // 1. ПОИСК COLLABZA SDK В ГЛОБАЛЬНЫХ ПЕРЕМЕННЫХ
        log('=== ПОИСК COLLABZA/ВНЕШНИХ SDK ===');
        const possibleSDKs = [
            'Collabza', 'collabza', 'COLLABZA',
            'CollabzaSDK', 'collabzaSDK', 'collabza_sdk',
            'CZ', 'cz', 'czSDK',
            'UserSDK', 'userSDK', 'user_sdk',
            'AuthSDK', 'authSDK', 'auth_sdk',
            'SessionSDK', 'sessionSDK', 'session_sdk'
        ];
        
        possibleSDKs.forEach(sdkName => {
            if (window[sdkName]) {
                log(`НАЙДЕН SDK: window.${sdkName}`, window[sdkName]);
                
                // Проверяем методы SDK
                if (typeof window[sdkName] === 'object') {
                    const methods = Object.keys(window[sdkName]);
                    log(`Методы ${sdkName}:`, methods);
                    
                    // Ищем методы получения пользователя
                    const userMethods = methods.filter(method => 
                        method.toLowerCase().includes('user') || 
                        method.toLowerCase().includes('email') ||
                        method.toLowerCase().includes('current') ||
                        method.toLowerCase().includes('session') ||
                        method.toLowerCase().includes('auth')
                    );
                    
                    if (userMethods.length > 0) {
                        log(`Найдены методы пользователя в ${sdkName}:`, userMethods);
                        
                        userMethods.forEach(method => {
                            try {
                                if (typeof window[sdkName][method] === 'function') {
                                    const result = window[sdkName][method]();
                                    log(`${sdkName}.${method}():`, result);
                                    if (result && result.email) {
                                        log(`НАЙДЕН EMAIL через ${sdkName}.${method}(): ${result.email}`);
                                    }
                                } else {
                                    log(`${sdkName}.${method}:`, window[sdkName][method]);
                                    if (window[sdkName][method] && window[sdkName][method].email) {
                                        log(`НАЙДЕН EMAIL в ${sdkName}.${method}: ${window[sdkName][method].email}`);
                                    }
                                }
                            } catch (error) {
                                log(`Ошибка при вызове ${sdkName}.${method}:`, error);
                            }
                        });
                    }
                }
            }
        });
        
        // 2. ПОИСК ВСЕХ ГЛОБАЛЬНЫХ ПЕРЕМЕННЫХ С ДАННЫМИ ПОЛЬЗОВАТЕЛЯ
        log('=== ПОИСК ВСЕХ ГЛОБАЛЬНЫХ ПЕРЕМЕННЫХ ===');
        const allWindowKeys = Object.keys(window);
        const userRelatedKeys = allWindowKeys.filter(key => 
            key.toLowerCase().includes('user') ||
            key.toLowerCase().includes('auth') ||
            key.toLowerCase().includes('session') ||
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('email') ||
            key.toLowerCase().includes('current') ||
            key.toLowerCase().includes('member') ||
            key.toLowerCase().includes('profile') ||
            key.toLowerCase().includes('account')
        );
        
        log('Найдены переменные связанные с пользователем:', userRelatedKeys);
        
        userRelatedKeys.forEach(key => {
            try {
                const value = window[key];
                log(`window.${key}:`, value);
                
                if (value && typeof value === 'object') {
                    if (value.email) {
                        log(`НАЙДЕН EMAIL в window.${key}: ${value.email}`);
                    }
                    
                    // Проверяем вложенные объекты
                    Object.keys(value).forEach(subKey => {
                        if (subKey.toLowerCase().includes('email') || 
                            subKey.toLowerCase().includes('user') ||
                            subKey.toLowerCase().includes('current')) {
                            log(`  ${key}.${subKey}:`, value[subKey]);
                            if (value[subKey] && value[subKey].email) {
                                log(`НАЙДЕН EMAIL в window.${key}.${subKey}: ${value[subKey].email}`);
                            }
                        }
                    });
                }
            } catch (error) {
                log(`Ошибка при проверке window.${key}:`, error);
            }
        });
        
        // 3. ПОИСК ТОКЕНОВ И СЕССИЙ В STORAGE
        log('=== ПОИСК ТОКЕНОВ COLLABZA В STORAGE ===');
        
        // localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.toLowerCase().includes('collabza') ||
                key.toLowerCase().includes('token') ||
                key.toLowerCase().includes('session') ||
                key.toLowerCase().includes('auth') ||
                key.toLowerCase().includes('jwt') ||
                key.toLowerCase().includes('access') ||
                key.toLowerCase().includes('bearer')) {
                
                const value = localStorage.getItem(key);
                log(`localStorage ${key}:`, value);
                
                try {
                    const parsed = JSON.parse(value);
                    log(`Парсированный ${key}:`, parsed);
                    if (parsed.email) {
                        log(`НАЙДЕН EMAIL в localStorage ${key}: ${parsed.email}`);
                    }
                } catch (e) {
                    // Не JSON
                }
            }
        }
        
        // sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key.toLowerCase().includes('collabza') ||
                key.toLowerCase().includes('token') ||
                key.toLowerCase().includes('session') ||
                key.toLowerCase().includes('auth') ||
                key.toLowerCase().includes('jwt') ||
                key.toLowerCase().includes('access') ||
                key.toLowerCase().includes('bearer')) {
                
                const value = sessionStorage.getItem(key);
                log(`sessionStorage ${key}:`, value);
                
                try {
                    const parsed = JSON.parse(value);
                    log(`Парсированный ${key}:`, parsed);
                    if (parsed.email) {
                        log(`НАЙДЕН EMAIL в sessionStorage ${key}: ${parsed.email}`);
                    }
                } catch (e) {
                    // Не JSON
                }
            }
        }
        
        // 4. ПОИСК ТОКЕНОВ В КУКАХ
        log('=== ПОИСК ТОКЕНОВ COLLABZA В КУКАХ ===');
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name.toLowerCase().includes('collabza') ||
                name.toLowerCase().includes('token') ||
                name.toLowerCase().includes('session') ||
                name.toLowerCase().includes('auth') ||
                name.toLowerCase().includes('jwt') ||
                name.toLowerCase().includes('access') ||
                name.toLowerCase().includes('bearer')) {
                
                try {
                    const decoded = decodeURIComponent(value || '');
                    log(`Кука ${name}:`, decoded);
                    
                    try {
                        const parsed = JSON.parse(decoded);
                        log(`Парсированная кука ${name}:`, parsed);
                        if (parsed.email) {
                            log(`НАЙДЕН EMAIL в куке ${name}: ${parsed.email}`);
                        }
                    } catch (e) {
                        // Не JSON
                    }
                } catch (e) {
                    log(`Ошибка декодирования куки ${name}:`, e);
                }
            }
        });
        
        // 5. ПОИСК СКРИПТОВ COLLABZA НА СТРАНИЦЕ
        log('=== ПОИСК СКРИПТОВ COLLABZA НА СТРАНИЦЕ ===');
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach((script, index) => {
            const src = script.src;
            if (src.toLowerCase().includes('collabza') ||
                src.toLowerCase().includes('auth') ||
                src.toLowerCase().includes('user') ||
                src.toLowerCase().includes('session') ||
                src.toLowerCase().includes('sdk')) {
                log(`Найден скрипт ${index}: ${src}`);
            }
        });
        
        log('=== КОНЕЦ ПОИСКА COLLABZA SDK ===');
        log('ВНИМАНИЕ: Ищите строки с "НАЙДЕН EMAIL" или "НАЙДЕН SDK"');
        
        return null; // Пока возвращаем null для диагностики
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