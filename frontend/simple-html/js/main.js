// Основной файл JavaScript для приложения

// Управление уведомлениями
const notificationEl = document.getElementById('notification');
const notificationMessageEl = document.getElementById('notification-message');
const closeNotificationBtn = document.getElementById('close-notification');

function showNotification(message, type = 'success') {
    notificationMessageEl.textContent = message;
    notificationEl.classList.remove('hidden', 'bg-green-50', 'bg-red-50', 'bg-blue-50');
    
    switch (type) {
        case 'success':
            notificationEl.classList.add('bg-green-50');
            break;
        case 'error':
            notificationEl.classList.add('bg-red-50');
            break;
        case 'info':
            notificationEl.classList.add('bg-blue-50');
            break;
    }
    
    notificationEl.classList.remove('hidden');
    
    // Автоматически скрываем уведомление через 5 секунд
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    notificationEl.classList.add('hidden');
}

// Добавляем обработчик события для закрытия уведомления
if (closeNotificationBtn) {
    closeNotificationBtn.addEventListener('click', hideNotification);
}

// Функция для работы с локальным хранилищем
function getLocalStorage(key, defaultValue = null) {
    const value = localStorage.getItem(key);
    if (value) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }
    return defaultValue;
}

function setLocalStorage(key, value) {
    if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value));
    } else {
        localStorage.setItem(key, value);
    }
}

// Функция для проверки аутентификации
function checkAuth() {
    const token = getLocalStorage('token');
    const currentUser = getLocalStorage('user');
    
    // Если нет токена и мы не на странице авторизации, перенаправляем на логин
    if (!token && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
        return false;
    }
    
    // Если есть токен и мы на странице авторизации, перенаправляем на главную
    if (token && window.location.href.includes('login.html')) {
        window.location.href = 'index.html';
        return true;
    }
    
    // Обновляем информацию о пользователе в шапке, если он авторизован
    if (token && currentUser) {
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) {
            userNameEl.textContent = currentUser.name || 'Пользователь';
        }
        
        return true;
    }
    
    return false;
}

// Функция для выхода из системы
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Добавляем обработчик события для кнопки выхода
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

// Функция для работы с API (имитация)
async function mockApiCall(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        // Имитируем задержку сети
        setTimeout(() => {
            // Имитация данных API
            const mockData = {
                // Записи на услуги
                appointments: [
                    {
                        id: 1,
                        client: { id: 1, name: 'Иванова Анна', phone: '+7 (903) 123-45-67' },
                        service: { id: 1, name: 'Стрижка', price: 1500, duration: 60 },
                        branch: { id: 1, name: 'Салон на Невском' },
                        specialist: { id: 1, name: 'Петрова Елена' },
                        startTime: '2023-06-15T10:00:00',
                        endTime: '2023-06-15T11:00:00',
                        status: 'COMPLETED',
                        source: 'PHONE'
                    },
                    {
                        id: 2,
                        client: { id: 2, name: 'Сидоров Петр', phone: '+7 (905) 987-65-43' },
                        service: { id: 2, name: 'Маникюр', price: 2000, duration: 90 },
                        branch: { id: 1, name: 'Салон на Невском' },
                        specialist: { id: 2, name: 'Смирнова Ольга' },
                        startTime: '2023-06-15T11:30:00',
                        endTime: '2023-06-15T13:00:00',
                        status: 'SCHEDULED',
                        source: 'WEBSITE'
                    },
                    {
                        id: 3,
                        client: { id: 3, name: 'Кузнецова Мария', phone: '+7 (901) 456-78-90' },
                        service: { id: 3, name: 'Окрашивание', price: 5000, duration: 120 },
                        branch: { id: 2, name: 'Салон в ТЦ Галерея' },
                        specialist: { id: 3, name: 'Козлов Игорь' },
                        startTime: '2023-06-16T14:00:00',
                        endTime: '2023-06-16T16:00:00',
                        status: 'CONFIRMED',
                        source: 'APP'
                    }
                ],
                
                // Клиенты
                clients: [
                    { id: 1, name: 'Иванова Анна', phone: '+7 (903) 123-45-67', email: 'ivanova@example.com' },
                    { id: 2, name: 'Сидоров Петр', phone: '+7 (905) 987-65-43', email: 'sidorov@example.com' },
                    { id: 3, name: 'Кузнецова Мария', phone: '+7 (901) 456-78-90', email: 'kuznecova@example.com' }
                ],
                
                // Услуги
                services: [
                    { id: 1, name: 'Стрижка', price: 1500, duration: 60 },
                    { id: 2, name: 'Маникюр', price: 2000, duration: 90 },
                    { id: 3, name: 'Окрашивание', price: 5000, duration: 120 },
                    { id: 4, name: 'Массаж', price: 3000, duration: 60 },
                    { id: 5, name: 'Педикюр', price: 2500, duration: 60 }
                ],
                
                // Филиалы
                branches: [
                    { id: 1, name: 'Салон на Невском', address: 'Невский проспект, 1' },
                    { id: 2, name: 'Салон в ТЦ Галерея', address: 'Лиговский проспект, 30' }
                ],
                
                // Специалисты
                specialists: [
                    { id: 1, name: 'Петрова Елена', position: 'Стилист' },
                    { id: 2, name: 'Смирнова Ольга', position: 'Мастер маникюра' },
                    { id: 3, name: 'Козлов Игорь', position: 'Колорист' }
                ]
            };
            
            // Успешный ответ для разных эндпоинтов
            switch (endpoint) {
                case 'login':
                    if (data && data.email === 'demo@example.com' && data.password === 'password') {
                        resolve({
                            token: 'mock-jwt-token',
                            user: {
                                id: 1,
                                name: 'Демо Пользователь',
                                email: 'demo@example.com',
                                role: 'ADMIN'
                            }
                        });
                    } else {
                        reject({ message: 'Неверный email или пароль' });
                    }
                    break;
                case 'register':
                    resolve({
                        token: 'mock-jwt-token',
                        user: {
                            id: 1,
                            name: data.name,
                            email: data.email,
                            role: 'STAFF'
                        }
                    });
                    break;
                case 'appointments':
                    if (method === 'GET') {
                        resolve(mockData.appointments);
                    } else if (method === 'POST' || method === 'PUT') {
                        // Имитация создания/обновления записи
                        resolve({ ...data, id: data.id || Math.floor(Math.random() * 1000) + 10 });
                    } else if (method === 'DELETE') {
                        // Имитация удаления записи
                        resolve({ success: true });
                    }
                    break;
                case 'clients':
                    if (method === 'GET') {
                        resolve(mockData.clients);
                    } else {
                        resolve({ ...data, id: data.id || Math.floor(Math.random() * 1000) + 10 });
                    }
                    break;
                case 'services':
                    resolve(mockData.services);
                    break;
                case 'branches':
                    resolve(mockData.branches);
                    break;
                case 'specialists':
                    resolve(mockData.specialists);
                    break;
                default:
                    reject({ message: 'Неизвестный эндпоинт' });
            }
        }, 500); // Задержка 500 мс для имитации сетевого запроса
    });
}

// Функция для форматирования даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Функция для форматирования времени
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// Получение статуса записи в текстовом виде
function getStatusText(status) {
    const statusMap = {
        'SCHEDULED': 'Запланирован',
        'CONFIRMED': 'Подтвержден',
        'COMPLETED': 'Завершен',
        'CANCELLED': 'Отменен',
        'NO_SHOW': 'Не явился'
    };
    return statusMap[status] || status;
}

// Получение инициалов из имени
function getInitials(name) {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем аутентификацию
    checkAuth();
    
    // Активируем текущий пункт меню
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active-nav-item');
        }
    });
}); 