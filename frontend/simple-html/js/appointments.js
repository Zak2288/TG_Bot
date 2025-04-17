// JavaScript для работы со страницей записей

// Элементы DOM
const appointmentsTableEl = document.getElementById('appointments-table');
const appointmentsListEl = document.getElementById('appointments-list');
const appointmentsLoadingEl = document.getElementById('appointments-loading');
const noAppointmentsEl = document.getElementById('no-appointments');
const dateFilterEl = document.getElementById('date-filter');
const statusFilterEl = document.getElementById('status-filter');
const branchFilterEl = document.getElementById('branch-filter');
const applyFiltersBtn = document.getElementById('apply-filters-btn');
const createAppointmentBtn = document.getElementById('create-appointment-btn');

// Модальное окно для создания/редактирования записи
const appointmentModalEl = document.getElementById('appointment-modal');
const modalTitleEl = document.getElementById('modal-title');
const appointmentFormEl = document.getElementById('appointment-form');
const appointmentIdInput = document.getElementById('appointment-id');
const clientSelectEl = document.getElementById('client-select');
const serviceSelectEl = document.getElementById('service-select');
const branchSelectEl = document.getElementById('branch-select');
const specialistSelectEl = document.getElementById('specialist-select');
const dateInputEl = document.getElementById('date-input');
const timeInputEl = document.getElementById('time-input');
const durationInputEl = document.getElementById('duration-input');
const statusSelectEl = document.getElementById('status-select');
const notesInputEl = document.getElementById('notes-input');
const saveAppointmentBtn = document.getElementById('save-appointment-btn');
const cancelAppointmentBtn = document.getElementById('cancel-appointment-btn');

// Модальное окно подтверждения удаления
const deleteModalEl = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

// Текущий ID записи для удаления
let currentAppointmentIdToDelete = null;

// Инициализация страницы
document.addEventListener('DOMContentLoaded', function() {
    // Устанавливаем фильтр даты на сегодня по умолчанию
    const today = new Date().toISOString().split('T')[0];
    dateFilterEl.value = today;
    
    // Загружаем филиалы для фильтра
    loadBranches();
    
    // Загружаем записи
    loadAppointments();
    
    // Добавляем обработчики событий для фильтров
    applyFiltersBtn.addEventListener('click', loadAppointments);
    
    // Добавляем обработчики событий для модальных окон
    createAppointmentBtn.addEventListener('click', openCreateAppointmentModal);
    cancelAppointmentBtn.addEventListener('click', closeAppointmentModal);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    
    saveAppointmentBtn.addEventListener('click', saveAppointment);
    confirmDeleteBtn.addEventListener('click', deleteAppointment);
});

// Функция загрузки филиалов
async function loadBranches() {
    try {
        const branches = await mockApiCall('branches');
        
        // Заполняем выпадающий список филиалов для фильтра
        branchFilterEl.innerHTML = '<option value="">Все филиалы</option>';
        branches.forEach(branch => {
            const option = document.createElement('option');
            option.value = branch.id;
            option.textContent = branch.name;
            branchFilterEl.appendChild(option);
        });
        
        // Заполняем выпадающий список филиалов для формы
        branchSelectEl.innerHTML = '<option value="">Выберите филиал</option>';
        branches.forEach(branch => {
            const option = document.createElement('option');
            option.value = branch.id;
            option.textContent = branch.name;
            branchSelectEl.appendChild(option);
        });
    } catch (error) {
        showNotification('Ошибка загрузки филиалов', 'error');
    }
}

// Функция загрузки клиентов
async function loadClients() {
    try {
        const clients = await mockApiCall('clients');
        
        // Заполняем выпадающий список клиентов
        clientSelectEl.innerHTML = '<option value="">Выберите клиента</option>';
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            clientSelectEl.appendChild(option);
        });
    } catch (error) {
        showNotification('Ошибка загрузки клиентов', 'error');
    }
}

// Функция загрузки услуг
async function loadServices() {
    try {
        const services = await mockApiCall('services');
        
        // Заполняем выпадающий список услуг
        serviceSelectEl.innerHTML = '<option value="">Выберите услугу</option>';
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = `${service.name} (${service.price} ₽, ${service.duration} мин)`;
            option.dataset.duration = service.duration;
            serviceSelectEl.appendChild(option);
        });
        
        // Добавляем обработчик события изменения услуги для автоматического заполнения продолжительности
        serviceSelectEl.addEventListener('change', function() {
            const selectedOption = serviceSelectEl.options[serviceSelectEl.selectedIndex];
            if (selectedOption && selectedOption.dataset.duration) {
                durationInputEl.value = selectedOption.dataset.duration;
            }
        });
    } catch (error) {
        showNotification('Ошибка загрузки услуг', 'error');
    }
}

// Функция загрузки специалистов
async function loadSpecialists() {
    try {
        const specialists = await mockApiCall('specialists');
        
        // Заполняем выпадающий список специалистов
        specialistSelectEl.innerHTML = '<option value="">Выберите специалиста</option>';
        specialists.forEach(specialist => {
            const option = document.createElement('option');
            option.value = specialist.id;
            option.textContent = `${specialist.name} (${specialist.position})`;
            specialistSelectEl.appendChild(option);
        });
    } catch (error) {
        showNotification('Ошибка загрузки специалистов', 'error');
    }
}

// Функция загрузки записей на услуги
async function loadAppointments() {
    // Показываем индикатор загрузки
    appointmentsLoadingEl.classList.remove('hidden');
    appointmentsTableEl.classList.add('hidden');
    noAppointmentsEl.classList.add('hidden');
    
    try {
        // Получаем значения фильтров
        const dateFilter = dateFilterEl.value;
        const statusFilter = statusFilterEl.value;
        const branchFilter = branchFilterEl.value;
        
        // Загружаем записи
        const appointments = await mockApiCall('appointments');
        
        // Фильтруем записи
        let filteredAppointments = appointments;
        
        if (dateFilter) {
            filteredAppointments = filteredAppointments.filter(appointment => {
                const appointmentDate = new Date(appointment.startTime).toISOString().split('T')[0];
                return appointmentDate === dateFilter;
            });
        }
        
        if (statusFilter) {
            filteredAppointments = filteredAppointments.filter(appointment => appointment.status === statusFilter);
        }
        
        if (branchFilter) {
            filteredAppointments = filteredAppointments.filter(appointment => appointment.branch.id.toString() === branchFilter);
        }
        
        // Отображаем записи или сообщение об отсутствии записей
        if (filteredAppointments.length > 0) {
            renderAppointments(filteredAppointments);
            appointmentsTableEl.classList.remove('hidden');
        } else {
            noAppointmentsEl.classList.remove('hidden');
        }
    } catch (error) {
        showNotification('Ошибка загрузки записей', 'error');
    } finally {
        // Скрываем индикатор загрузки
        appointmentsLoadingEl.classList.add('hidden');
    }
}

// Функция отображения записей в таблице
function renderAppointments(appointments) {
    // Очищаем таблицу
    appointmentsListEl.innerHTML = '';
    
    // Добавляем записи в таблицу
    appointments.forEach(appointment => {
        const tr = document.createElement('tr');
        tr.classList.add('hover:bg-gray-50');
        
        // Клиент
        const clientCell = document.createElement('td');
        clientCell.classList.add('px-6', 'py-4', 'whitespace-nowrap');
        clientCell.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                        ${getInitials(appointment.client.name)}
                    </div>
                </div>
                <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                        ${appointment.client.name}
                    </div>
                    <div class="text-sm text-gray-500">
                        ${appointment.client.phone}
                    </div>
                </div>
            </div>
        `;
        
        // Услуга
        const serviceCell = document.createElement('td');
        serviceCell.classList.add('px-6', 'py-4', 'whitespace-nowrap');
        serviceCell.innerHTML = `
            <div class="text-sm text-gray-900">${appointment.service.name}</div>
            <div class="text-sm text-gray-500">${appointment.service.price} ₽</div>
        `;
        
        // Дата и время
        const dateTimeCell = document.createElement('td');
        dateTimeCell.classList.add('px-6', 'py-4', 'whitespace-nowrap');
        dateTimeCell.innerHTML = `
            <div class="text-sm text-gray-900">${formatDate(appointment.startTime)}</div>
            <div class="text-sm text-gray-500">
                ${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}
            </div>
        `;
        
        // Филиал
        const branchCell = document.createElement('td');
        branchCell.classList.add('px-6', 'py-4', 'whitespace-nowrap', 'text-sm', 'text-gray-500');
        branchCell.textContent = appointment.branch.name;
        
        // Статус
        const statusCell = document.createElement('td');
        statusCell.classList.add('px-6', 'py-4', 'whitespace-nowrap');
        
        let statusClass = '';
        switch (appointment.status) {
            case 'SCHEDULED':
                statusClass = 'status-scheduled';
                break;
            case 'CONFIRMED':
                statusClass = 'status-confirmed';
                break;
            case 'COMPLETED':
                statusClass = 'status-completed';
                break;
            case 'CANCELLED':
                statusClass = 'status-cancelled';
                break;
            case 'NO_SHOW':
                statusClass = 'status-no-show';
                break;
        }
        
        statusCell.innerHTML = `
            <span class="status-badge ${statusClass}">
                ${getStatusText(appointment.status)}
            </span>
        `;
        
        // Действия
        const actionsCell = document.createElement('td');
        actionsCell.classList.add('px-6', 'py-4', 'whitespace-nowrap', 'text-sm', 'font-medium');
        actionsCell.innerHTML = `
            <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-btn" data-id="${appointment.id}">
                Редактировать
            </button>
            <button class="text-red-600 hover:text-red-900 delete-btn" data-id="${appointment.id}">
                Удалить
            </button>
        `;
        
        // Добавляем ячейки в строку
        tr.appendChild(clientCell);
        tr.appendChild(serviceCell);
        tr.appendChild(dateTimeCell);
        tr.appendChild(branchCell);
        tr.appendChild(statusCell);
        tr.appendChild(actionsCell);
        
        // Добавляем строку в таблицу
        appointmentsListEl.appendChild(tr);
    });
    
    // Добавляем обработчики событий для кнопок редактирования и удаления
    const editButtons = document.querySelectorAll('.edit-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = this.dataset.id;
            openEditAppointmentModal(appointmentId);
        });
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = this.dataset.id;
            openDeleteModal(appointmentId);
        });
    });
}

// Функция открытия модального окна создания записи
async function openCreateAppointmentModal() {
    // Устанавливаем заголовок модального окна
    modalTitleEl.textContent = 'Новая запись';
    
    // Сбрасываем форму
    appointmentFormEl.reset();
    appointmentIdInput.value = '';
    
    // Устанавливаем дату на сегодня и время на текущее время
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = Math.ceil(now.getMinutes() / 15) * 15 % 60;
    const currentTime = `${currentHour}:${currentMinute.toString().padStart(2, '0')}`;
    
    dateInputEl.value = today;
    timeInputEl.value = currentTime;
    
    // Загружаем данные для выпадающих списков
    await Promise.all([
        loadClients(),
        loadServices(),
        loadBranches(),
        loadSpecialists()
    ]);
    
    // Открываем модальное окно
    appointmentModalEl.classList.remove('hidden');
}

// Функция открытия модального окна редактирования записи
async function openEditAppointmentModal(appointmentId) {
    // Устанавливаем заголовок модального окна
    modalTitleEl.textContent = 'Редактирование записи';
    
    try {
        // Загружаем данные для выпадающих списков
        await Promise.all([
            loadClients(),
            loadServices(),
            loadBranches(),
            loadSpecialists()
        ]);
        
        // Загружаем данные о записи
        const appointments = await mockApiCall('appointments');
        const appointment = appointments.find(a => a.id.toString() === appointmentId.toString());
        
        if (!appointment) {
            showNotification('Запись не найдена', 'error');
            return;
        }
        
        // Заполняем форму данными о записи
        appointmentIdInput.value = appointment.id;
        clientSelectEl.value = appointment.client.id;
        serviceSelectEl.value = appointment.service.id;
        branchSelectEl.value = appointment.branch.id;
        specialistSelectEl.value = appointment.specialist.id;
        
        const startDate = new Date(appointment.startTime);
        dateInputEl.value = startDate.toISOString().split('T')[0];
        timeInputEl.value = startDate.toTimeString().substring(0, 5);
        
        durationInputEl.value = appointment.service.duration;
        statusSelectEl.value = appointment.status;
        notesInputEl.value = appointment.notes || '';
        
        // Открываем модальное окно
        appointmentModalEl.classList.remove('hidden');
    } catch (error) {
        showNotification('Ошибка загрузки данных о записи', 'error');
    }
}

// Функция закрытия модального окна создания/редактирования записи
function closeAppointmentModal() {
    appointmentModalEl.classList.add('hidden');
}

// Функция сохранения записи
async function saveAppointment() {
    // Проверяем валидность формы
    if (!appointmentFormEl.checkValidity()) {
        appointmentFormEl.reportValidity();
        return;
    }
    
    // Получаем данные из формы
    const appointmentId = appointmentIdInput.value;
    const clientId = clientSelectEl.value;
    const serviceId = serviceSelectEl.value;
    const branchId = branchSelectEl.value;
    const specialistId = specialistSelectEl.value;
    const date = dateInputEl.value;
    const time = timeInputEl.value;
    const duration = parseInt(durationInputEl.value);
    const status = statusSelectEl.value;
    const notes = notesInputEl.value;
    
    // Создаем объект с данными записи
    const appointmentData = {
        id: appointmentId || null,
        clientId,
        serviceId,
        branchId,
        specialistId,
        startTime: `${date}T${time}:00`,
        duration,
        status,
        notes
    };
    
    try {
        // Определяем метод запроса в зависимости от наличия ID
        const method = appointmentId ? 'PUT' : 'POST';
        
        // Отправляем запрос на сохранение записи
        await mockApiCall('appointments', method, appointmentData);
        
        // Закрываем модальное окно
        closeAppointmentModal();
        
        // Перезагружаем список записей
        loadAppointments();
        
        // Показываем уведомление об успешном сохранении
        showNotification(appointmentId ? 'Запись успешно обновлена' : 'Запись успешно создана', 'success');
    } catch (error) {
        showNotification('Ошибка сохранения записи', 'error');
    }
}

// Функция открытия модального окна подтверждения удаления
function openDeleteModal(appointmentId) {
    currentAppointmentIdToDelete = appointmentId;
    deleteModalEl.classList.remove('hidden');
}

// Функция закрытия модального окна подтверждения удаления
function closeDeleteModal() {
    deleteModalEl.classList.add('hidden');
    currentAppointmentIdToDelete = null;
}

// Функция удаления записи
async function deleteAppointment() {
    if (!currentAppointmentIdToDelete) {
        return;
    }
    
    try {
        // Отправляем запрос на удаление записи
        await mockApiCall('appointments', 'DELETE', { id: currentAppointmentIdToDelete });
        
        // Закрываем модальное окно
        closeDeleteModal();
        
        // Перезагружаем список записей
        loadAppointments();
        
        // Показываем уведомление об успешном удалении
        showNotification('Запись успешно удалена', 'success');
    } catch (error) {
        showNotification('Ошибка удаления записи', 'error');
    }
} 