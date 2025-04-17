// JavaScript для страницы авторизации

document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, есть ли уже токен авторизации
    const token = localStorage.getItem('token');
    
    // Если пользователь уже авторизован, перенаправляем на главную страницу
    if (token) {
        window.location.href = 'index.html';
        return;
    }
    
    // Добавляем обработчик события для формы авторизации
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Функция обработки авторизации
async function handleLogin(event) {
    event.preventDefault();
    
    // Получаем данные из формы
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    try {
        // Показываем индикатор загрузки
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Вход...';
        
        // Отправляем запрос на авторизацию
        const response = await mockApiCall('login', 'POST', { email, password });
        
        // Сохраняем токен и данные пользователя в localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Показываем уведомление об успешной авторизации
        showNotification('Вход выполнен успешно', 'success');
        
        // Перенаправляем на главную страницу
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        // Показываем уведомление об ошибке
        showNotification(error.message || 'Ошибка авторизации', 'error');
        
        // Восстанавливаем кнопку
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
} 