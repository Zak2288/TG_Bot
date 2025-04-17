// JavaScript для страницы дашборда

document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем страницу
    checkAuth();
    
    // Загружаем данные для дашборда
    loadDashboardData();
    
    // Загружаем последние записи
    loadRecentAppointments();
});

// Функция загрузки данных для дашборда
async function loadDashboardData() {
    try {
        // Загружаем записи
        const appointments = await mockApiCall('appointments');
        
        // Загружаем клиентов
        const clients = await mockApiCall('clients');
        
        // Получаем сегодняшнюю дату
        const today = new Date().toISOString().split('T')[0];
        
        // Фильтруем записи на сегодня
        const todayAppointments = appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.startTime).toISOString().split('T')[0];
            return appointmentDate === today;
        });
        
        // Считаем выручку за сегодня
        const todayRevenue = todayAppointments.reduce((total, appointment) => {
            // Учитываем только завершенные записи
            if (appointment.status === 'COMPLETED') {
                return total + appointment.service.price;
            }
            return total;
        }, 0);
        
        // Рассчитываем эффективность (соотношение завершенных и отмененных записей)
        const completedAppointments = appointments.filter(a => a.status === 'COMPLETED').length;
        const cancelledAppointments = appointments.filter(a => a.status === 'CANCELLED' || a.status === 'NO_SHOW').length;
        const totalAppointmentsCount = completedAppointments + cancelledAppointments;
        const efficiency = totalAppointmentsCount > 0 
            ? Math.round((completedAppointments / totalAppointmentsCount) * 100) 
            : 100;
        
        // Обновляем элементы на странице
        document.getElementById('today-appointments-count').textContent = todayAppointments.length;
        document.getElementById('total-clients-count').textContent = clients.length;
        document.getElementById('today-revenue').textContent = `${todayRevenue.toLocaleString()} ₽`;
        document.getElementById('efficiency-percentage').textContent = `${efficiency}%`;
        
        // Загружаем данные для графика продаж
        loadSalesChart();
    } catch (error) {
        showNotification('Ошибка загрузки данных для дашборда', 'error');
    }
}

// Функция загрузки последних записей
async function loadRecentAppointments() {
    const appointmentsLoadingEl = document.getElementById('appointments-loading');
    const recentAppointmentsEl = document.getElementById('recent-appointments');
    
    try {
        // Загружаем записи
        const appointments = await mockApiCall('appointments');
        
        // Сортируем записи по дате (от новых к старым)
        appointments.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        
        // Берем последние 5 записей
        const recentAppointments = appointments.slice(0, 5);
        
        // Очищаем контейнер
        recentAppointmentsEl.innerHTML = '';
        
        // Добавляем записи в контейнер
        recentAppointments.forEach(appointment => {
            const appointmentEl = document.createElement('div');
            appointmentEl.className = 'px-4 py-4 sm:px-6 hover:bg-gray-50';
            
            const status = getStatusText(appointment.status);
            let statusClass = '';
            
            switch (appointment.status) {
                case 'SCHEDULED': statusClass = 'status-scheduled'; break;
                case 'CONFIRMED': statusClass = 'status-confirmed'; break;
                case 'COMPLETED': statusClass = 'status-completed'; break;
                case 'CANCELLED': statusClass = 'status-cancelled'; break;
                case 'NO_SHOW': statusClass = 'status-no-show'; break;
            }
            
            appointmentEl.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                                ${getInitials(appointment.client.name)}
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">
                                ${appointment.client.name}
                            </div>
                            <div class="text-sm text-gray-500">
                                ${appointment.service.name}
                            </div>
                        </div>
                    </div>
                    <div class="ml-2 flex-shrink-0 flex">
                        <div class="flex items-center">
                            <div class="text-sm text-gray-500 mr-2">
                                ${formatDate(appointment.startTime)} ${formatTime(appointment.startTime)}
                            </div>
                            <span class="status-badge ${statusClass}">
                                ${status}
                            </span>
                        </div>
                    </div>
                </div>
            `;
            
            recentAppointmentsEl.appendChild(appointmentEl);
        });
        
        // Скрываем индикатор загрузки и показываем записи
        appointmentsLoadingEl.classList.add('hidden');
        recentAppointmentsEl.classList.remove('hidden');
    } catch (error) {
        showNotification('Ошибка загрузки последних записей', 'error');
    }
}

// Функция загрузки данных для графика продаж
function loadSalesChart() {
    // Получаем элемент canvas
    const ctx = document.getElementById('sales-chart').getContext('2d');
    
    // Получаем последние 7 дней
    const dates = [];
    const sales = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const formattedDate = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        dates.push(formattedDate);
        
        // Имитация данных продаж
        sales.push(Math.floor(Math.random() * 50000) + 10000);
    }
    
    // Создаем градиент для графика
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
    
    // Создаем график
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Продажи (₽)',
                data: sales,
                backgroundColor: gradient,
                borderColor: 'rgb(79, 70, 229)',
                borderWidth: 2,
                pointBackgroundColor: 'rgb(79, 70, 229)',
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('ru-RU') + ' ₽';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1F2937',
                    bodyColor: '#1F2937',
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toLocaleString('ru-RU') + ' ₽';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
} 