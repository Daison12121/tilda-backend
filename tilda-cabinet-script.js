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
        log('=== ДИАГНОСТИКА СИСТЕМЫ ТИЛЬДЫ ===');
        log('window.tildaMembers:', !!window.tildaMembers);
        log('window.currentUser:', !!window.currentUser);
        log('window.tildaForm:', !!window.tildaForm);
        
        if (window.tildaMembers) {
            log('tildaMembers структура:', Object.keys(window.tildaMembers));
            
            // Проверяем методы получения текущего пользователя
            if (typeof window.tildaMembers.getCurrentUser === 'function') {
                try {
                    const currentUser = window.tildaMembers.getCurrentUser();
                    log('getCurrentUser результат:', currentUser);
                    if (currentUser && currentUser.email) {
                        log(`Email найден через getCurrentUser: ${currentUser.email}`);
                        return currentUser.email;
                    }
                } catch (error) {
                    log('Ошибка при вызове getCurrentUser:', error);
                }
            }
            
            // Проверяем разные варианты структуры данных
            const memberSources = [
                { name: 'currentUser', data: window.tildaMembers.currentUser },
                { name: 'user', data: window.tildaMembers.user },
                { name: 'member', data: window.tildaMembers.member }
            ];
            
            for (const source of memberSources) {
                log(`Проверяем ${source.name}:`, source.data);
                if (source.data && source.data.email) {
                    log(`Email найден в tildaMembers.${source.name}: ${source.data.email}`);
                    return source.data.email;
                }
            }
        }
        
        // Проверяем глобальные переменные
        if (window.currentUser) {
            log('currentUser структура:', window.currentUser);
            if (window.currentUser.email) {
                log(`Email найден в currentUser: ${window.currentUser.email}`);
                return window.currentUser.email;
            }
        }
        
        if (window.tildaForm) {
            log('tildaForm структура:', window.tildaForm);
            if (window.tildaForm.userEmail) {
                log(`Email найден в tildaForm: ${window.tildaForm.userEmail}`);
                return window.tildaForm.userEmail;
            }
        }
        
        // Проверяем куки
        const cookies = document.cookie.split(';');
        log('Куки:', cookies);
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name.includes('email') || name.includes('user')) {
                log(`Найдена кука ${name}: ${value}`);
            }
        }
        
        log('Email не найден ни в одном источнике');
        return null;
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
        
        // Создаем глобальный объект для управления кабинетом
        window.tildaCabinet = {
            refresh: loadUserProfile,
            getEmail: getTildaUserEmail,
            testWithEmail: testWithEmail
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