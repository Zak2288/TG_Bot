// API настройки и функции

// Базовый URL API
const API_URL = 'http://localhost:3000/api';

// Функция для выполнения запросов к API
async function apiCall(endpoint, method = 'GET', data = null) {
    const url = `${API_URL}/${endpoint}`;
    const token = localStorage.getItem('token');
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    // Добавляем токен авторизации, если он есть
    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }
    
    // Добавляем тело запроса для методов POST, PUT
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        
        // Если ответ не OK, выбрасываем ошибку
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Произошла ошибка при выполнении запроса');
        }
        
        // Для некоторых запросов может не быть JSON ответа
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return true;
    } catch (error) {
        console.error('API Error:', error);
        // Если ошибка 401 (Unauthorized), делаем редирект на страницу входа
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
            logout();
        }
        throw error;
    }
}

// Аутентификация
async function login(email, password) {
    return apiCall('auth/login', 'POST', { email, password });
}

async function register(userData) {
    return apiCall('auth/register', 'POST', userData);
}

// Записи
async function getAppointments(params = {}) {
    // Формируем строку запроса из переданных параметров
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            queryParams.append(key, value);
        }
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiCall(`appointments${queryString}`);
}

async function getAppointment(id) {
    return apiCall(`appointments/${id}`);
}

async function createAppointment(appointmentData) {
    return apiCall('appointments', 'POST', appointmentData);
}

async function updateAppointment(id, appointmentData) {
    return apiCall(`appointments/${id}`, 'PUT', appointmentData);
}

async function deleteAppointment(id) {
    return apiCall(`appointments/${id}`, 'DELETE');
}

// Клиенты
async function getClients(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            queryParams.append(key, value);
        }
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiCall(`clients${queryString}`);
}

async function getClient(id) {
    return apiCall(`clients/${id}`);
}

async function createClient(clientData) {
    return apiCall('clients', 'POST', clientData);
}

async function updateClient(id, clientData) {
    return apiCall(`clients/${id}`, 'PUT', clientData);
}

async function deleteClient(id) {
    return apiCall(`clients/${id}`, 'DELETE');
}

// Услуги
async function getServices() {
    return apiCall('services');
}

async function getService(id) {
    return apiCall(`services/${id}`);
}

// Филиалы
async function getBranches() {
    return apiCall('branches');
}

async function getBranch(id) {
    return apiCall(`branches/${id}`);
} 