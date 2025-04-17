// JavaScript для страницы регистрации

document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, есть ли уже токен авторизации
    const token = localStorage.getItem('token');
    
    // Если пользователь уже авторизован, перенаправляем на главную страницу
    if (token) {
        window.location.href = 'index.html';
        return;
    }
    
    // Добавляем обработчик события для формы регистрации
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Добавляем обработчик для проверки совпадения паролей
    const passwordConfirmInput = document.getElementById('password-confirm');
    if (passwordConfirmInput) {
        passwordConfirmInput.addEventListener('input', validatePasswordMatch);
    }
});

// Функция валидации совпадения паролей
function validatePasswordMatch() {
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password-confirm');
    
    if (passwordInput.value !== passwordConfirmInput.value) {
        passwordConfirmInput.setCustomValidity('Пароли не совпадают');
    } else {
        passwordConfirmInput.setCustomValidity('');
    }
}

// Функция обработки регистрации
async function handleRegister(event) {
    event.preventDefault();
    
    // Получаем данные из формы
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const agreeTerms = document.getElementById('agree-terms').checked;
    
    // Проверяем совпадение паролей
    if (password !== passwordConfirm) {
        showNotification('Пароли не совпадают', 'error');
        return;
    }
    
    // Проверяем согласие с условиями
    if (!agreeTerms) {
        showNotification('Необходимо согласиться с условиями использования', 'error');
        return;
    }
    
    try {
        // Показываем индикатор загрузки
        const submitButton = registerForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Регистрация...';
        
        // Отправляем запрос на регистрацию
        const response = await mockApiCall('register', 'POST', { name, email, password });
        
        // Показываем уведомление об успешной регистрации
        showNotification('Регистрация выполнена успешно. Сейчас вы будете перенаправлены на страницу входа.', 'success');
        
        // Перенаправляем на страницу входа
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } catch (error) {
        // Показываем уведомление об ошибке
        showNotification(error.message || 'Ошибка регистрации', 'error');
        
        // Восстанавливаем кнопку
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
} 