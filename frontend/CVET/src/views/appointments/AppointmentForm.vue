<template>
  <div>
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">{{ isEditMode ? 'Редактирование записи' : 'Новая запись' }}</h1>
      <p class="mt-1 text-sm text-gray-600">
        {{ isEditMode ? 'Изменение данных записи клиента' : 'Создание новой записи клиента на услугу' }}
      </p>
    </header>

    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <form @submit.prevent="saveAppointment">
          <!-- Основная информация -->
          <div class="space-y-6 sm:space-y-5">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">Основная информация</h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">Выберите клиента и услугу</p>
            </div>

            <div class="space-y-6 sm:space-y-5">
              <!-- Клиент -->
              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="client" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Клиент
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <div class="flex rounded-md shadow-sm">
                    <select
                      id="client"
                      v-model="form.clientId"
                      required
                      class="max-w-lg block focus:ring-primary-500 focus:border-primary-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Выберите клиента</option>
                      <option v-for="client in clients" :key="client.id" :value="client.id">
                        {{ client.name }} ({{ client.phone }})
                      </option>
                    </select>
                    <button
                      type="button"
                      class="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      @click="showNewClientModal = true"
                    >
                      Новый клиент
                    </button>
                  </div>
                </div>
              </div>

              <!-- Филиал -->
              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="branch" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Филиал
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <select
                    id="branch"
                    v-model="form.branchId"
                    required
                    class="max-w-lg block focus:ring-primary-500 focus:border-primary-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Выберите филиал</option>
                    <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                      {{ branch.name }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Услуга -->
              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="service" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Услуга
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <select
                    id="service"
                    v-model="form.serviceId"
                    required
                    class="max-w-lg block focus:ring-primary-500 focus:border-primary-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                    @change="updateDuration"
                  >
                    <option value="">Выберите услугу</option>
                    <option v-for="service in services" :key="service.id" :value="service.id">
                      {{ service.name }} ({{ service.price }} ₽)
                    </option>
                  </select>
                </div>
              </div>

              <!-- Мастер -->
              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="specialist" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Мастер
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <select
                    id="specialist"
                    v-model="form.specialistId"
                    class="max-w-lg block focus:ring-primary-500 focus:border-primary-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Мастер по умолчанию</option>
                    <option v-for="specialist in specialists" :key="specialist.id" :value="specialist.id">
                      {{ specialist.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Дата и время -->
          <div class="mt-10 space-y-6 sm:space-y-5">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">Дата и время</h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">Выберите дату и время записи</p>
            </div>

            <div class="space-y-6 sm:space-y-5">
              <!-- Дата -->
              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="date" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Дата
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    type="date"
                    id="date"
                    v-model="form.date"
                    required
                    class="max-w-lg block focus:ring-primary-500 focus:border-primary-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <!-- Время начала -->
              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="startTime" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Время начала
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    type="time"
                    id="startTime"
                    v-model="form.startTime"
                    required
                    class="max-w-lg block focus:ring-primary-500 focus:border-primary-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                    @change="updateEndTime"
                  />
                </div>
              </div>

              <!-- Продолжительность -->
              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="duration" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Продолжительность (мин)
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    type="number"
                    id="duration"
                    v-model.number="form.duration"
                    min="15"
                    step="15"
                    required
                    class="max-w-lg block focus:ring-primary-500 focus:border-primary-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                    @change="updateEndTime"
                  />
                </div>
              </div>

              <!-- Время окончания (рассчитывается автоматически) -->
              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="endTime" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Время окончания
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    type="time"
                    id="endTime"
                    :value="calculatedEndTime"
                    readonly
                    class="max-w-lg block bg-gray-100 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Дополнительная информация -->
          <div class="mt-10 space-y-6 sm:space-y-5">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">Дополнительная информация</h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">Дополнительные параметры записи</p>
            </div>

            <div class="space-y-6 sm:space-y-5">
              <!-- Статус -->
              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="status" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Статус
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <select
                    id="status"
                    v-model="form.status"
                    required
                    class="max-w-lg block focus:ring-primary-500 focus:border-primary-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="SCHEDULED">Запланирован</option>
                    <option value="CONFIRMED">Подтвержден</option>
                    <option value="COMPLETED">Завершен</option>
                    <option value="CANCELLED">Отменен</option>
                    <option value="NO_SHOW">Не явился</option>
                  </select>
                </div>
              </div>

              <!-- Источник -->
              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="source" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Источник
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <select
                    id="source"
                    v-model="form.source"
                    required
                    class="max-w-lg block focus:ring-primary-500 focus:border-primary-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="WEBSITE">Веб-сайт</option>
                    <option value="VK">ВКонтакте</option>
                    <option value="TELEGRAM">Телеграм</option>
                    <option value="AVITO">Авито</option>
                    <option value="PHONE">Телефон</option>
                    <option value="OTHER">Другое</option>
                  </select>
                </div>
              </div>

              <!-- Заметки -->
              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="notes" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Заметки
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <textarea
                    id="notes"
                    v-model="form.notes"
                    rows="3"
                    class="max-w-lg shadow-sm block w-full focus:ring-primary-500 focus:border-primary-500 sm:text-sm border border-gray-300 rounded-md"
                  ></textarea>
                  <p class="mt-2 text-sm text-gray-500">Любые дополнительные заметки по записи</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Кнопки управления -->
          <div class="pt-5 border-t border-gray-200">
            <div class="flex justify-end">
              <button
                type="button"
                @click="$router.go(-1)"
                class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Отмена
              </button>
              <button
                type="submit"
                class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Сохранить
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно создания нового клиента -->
    <div v-if="showNewClientModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Новый клиент
                </h3>
                <div class="mt-4">
                  <form @submit.prevent="saveNewClient">
                    <!-- Имя клиента -->
                    <div class="mb-4">
                      <label for="clientName" class="block text-sm font-medium text-gray-700">Имя</label>
                      <input
                        type="text"
                        id="clientName"
                        v-model="newClient.name"
                        required
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    
                    <!-- Телефон клиента -->
                    <div class="mb-4">
                      <label for="clientPhone" class="block text-sm font-medium text-gray-700">Телефон</label>
                      <input
                        type="tel"
                        id="clientPhone"
                        v-model="newClient.phone"
                        required
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    
                    <!-- Email клиента -->
                    <div class="mb-4">
                      <label for="clientEmail" class="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        id="clientEmail"
                        v-model="newClient.email"
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              @click="saveNewClient"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Сохранить
            </button>
            <button 
              type="button" 
              @click="showNewClientModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'AppointmentForm',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    
    // ID записи (если редактируем существующую)
    const appointmentId = computed(() => route.params.id);
    const isEditMode = computed(() => !!appointmentId.value);
    
    // Данные для загрузки в форму
    const clients = ref([]);
    const branches = ref([]);
    const services = ref([]);
    const specialists = ref([]);
    const loading = ref(false);
    
    // Модальное окно создания клиента
    const showNewClientModal = ref(false);
    const newClient = reactive({
      name: '',
      phone: '',
      email: ''
    });
    
    // Форма создания/редактирования записи
    const form = reactive({
      clientId: '',
      branchId: '',
      serviceId: '',
      specialistId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      duration: 60,
      status: 'SCHEDULED',
      source: 'PHONE',
      notes: ''
    });
    
    // Вычисляемое время окончания
    const calculatedEndTime = computed(() => {
      if (!form.startTime || !form.duration) return '';
      
      const [hours, minutes] = form.startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0);
      
      const endDate = new Date(startDate.getTime() + form.duration * 60000);
      const endHours = endDate.getHours().toString().padStart(2, '0');
      const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
      
      return `${endHours}:${endMinutes}`;
    });
    
    // Загрузка данных при монтировании компонента
    onMounted(async () => {
      loading.value = true;
      try {
        await Promise.all([
          fetchClients(),
          fetchBranches(),
          fetchServices(),
          fetchSpecialists()
        ]);
        
        // Если редактируем существующую запись, загружаем её данные
        if (isEditMode.value) {
          await loadAppointmentData();
        }
      } catch (error) {
        console.error('Error loading data:', error);
        store.dispatch('setError', 'Ошибка при загрузке данных');
      } finally {
        loading.value = false;
      }
    });
    
    // Методы для загрузки данных
    const fetchClients = async () => {
      try {
        // В реальном приложении здесь был бы запрос к API
        // Имитация данных для примера
        clients.value = [
          { id: 1, name: 'Иванов Иван', phone: '+7 (900) 123-45-67', email: 'ivanov@example.com' },
          { id: 2, name: 'Петров Петр', phone: '+7 (900) 234-56-78', email: 'petrov@example.com' },
          { id: 3, name: 'Сидорова Анна', phone: '+7 (900) 345-67-89', email: 'sidorova@example.com' },
          { id: 4, name: 'Козлов Михаил', phone: '+7 (900) 456-78-90', email: 'kozlov@example.com' },
          { id: 5, name: 'Новикова Екатерина', phone: '+7 (900) 567-89-01', email: 'novikova@example.com' }
        ];
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    
    const fetchBranches = async () => {
      try {
        // Имитация данных
        branches.value = [
          { id: 1, name: 'Центральный филиал' },
          { id: 2, name: 'Северный филиал' },
          { id: 3, name: 'Южный филиал' }
        ];
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    
    const fetchServices = async () => {
      try {
        // Имитация данных
        services.value = [
          { id: 1, name: 'Стрижка', price: 1500, duration: 60 },
          { id: 2, name: 'Маникюр', price: 2000, duration: 90 },
          { id: 3, name: 'Массаж', price: 3000, duration: 60 },
          { id: 4, name: 'Окрашивание', price: 5000, duration: 120 }
        ];
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    
    const fetchSpecialists = async () => {
      try {
        // Имитация данных
        specialists.value = [
          { id: 1, name: 'Алексеева Мария', specialization: 'Парикмахер' },
          { id: 2, name: 'Борисов Дмитрий', specialization: 'Массажист' },
          { id: 3, name: 'Васильева Ольга', specialization: 'Мастер маникюра' },
          { id: 4, name: 'Григорьев Андрей', specialization: 'Колорист' }
        ];
      } catch (error) {
        console.error('Error fetching specialists:', error);
      }
    };
    
    // Загрузка данных существующей записи при редактировании
    const loadAppointmentData = async () => {
      try {
        // В реальном приложении здесь был бы запрос к API
        // Имитация данных для примера
        const appointment = {
          id: appointmentId.value,
          clientId: 2,
          branchId: 1,
          serviceId: 3,
          specialistId: 2,
          startTime: '2023-06-15T14:00:00.000Z',
          endTime: '2023-06-15T15:00:00.000Z',
          status: 'CONFIRMED',
          source: 'WEBSITE',
          notes: 'Клиент предпочитает тайский массаж'
        };
        
        // Заполняем форму данными
        const startDateTime = new Date(appointment.startTime);
        const endDateTime = new Date(appointment.endTime);
        const durationInMinutes = (endDateTime - startDateTime) / 60000;
        
        form.clientId = appointment.clientId;
        form.branchId = appointment.branchId;
        form.serviceId = appointment.serviceId;
        form.specialistId = appointment.specialistId;
        form.date = startDateTime.toISOString().split('T')[0];
        form.startTime = startDateTime.toTimeString().slice(0, 5);
        form.duration = durationInMinutes;
        form.status = appointment.status;
        form.source = appointment.source;
        form.notes = appointment.notes;
      } catch (error) {
        console.error('Error loading appointment:', error);
        store.dispatch('setError', 'Ошибка при загрузке данных записи');
      }
    };
    
    // Метод для обновления длительности при выборе услуги
    const updateDuration = () => {
      const service = services.value.find(s => s.id === parseInt(form.serviceId));
      if (service) {
        form.duration = service.duration;
        updateEndTime();
      }
    };
    
    // Метод для обновления времени окончания
    const updateEndTime = () => {
      // Логика расчета времени окончания реализована в computed свойстве
    };
    
    // Метод для сохранения новой или обновления существующей записи
    const saveAppointment = async () => {
      try {
        // Подготовка данных для сохранения
        const startDateTime = new Date(`${form.date}T${form.startTime}`);
        const endDateTime = new Date(startDateTime.getTime() + form.duration * 60000);
        
        const appointmentData = {
          id: isEditMode.value ? parseInt(appointmentId.value) : undefined,
          clientId: parseInt(form.clientId),
          branchId: parseInt(form.branchId),
          serviceId: parseInt(form.serviceId),
          specialistId: form.specialistId ? parseInt(form.specialistId) : null,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          status: form.status,
          source: form.source,
          notes: form.notes
        };
        
        // В реальном приложении здесь был бы запрос к API
        if (isEditMode.value) {
          await store.dispatch('appointments/updateAppointment', appointmentData);
        } else {
          await store.dispatch('appointments/createAppointment', appointmentData);
        }
        
        // Переход к списку записей после сохранения
        router.push('/appointments');
      } catch (error) {
        console.error('Error saving appointment:', error);
        store.dispatch('setError', 'Ошибка при сохранении записи');
      }
    };
    
    // Метод для сохранения нового клиента
    const saveNewClient = async () => {
      try {
        // Подготовка данных для сохранения
        const clientData = {
          name: newClient.name,
          phone: newClient.phone,
          email: newClient.email
        };
        
        // В реальном приложении здесь был бы запрос к API
        // Имитация создания клиента с новым ID
        const newClientWithId = {
          ...clientData,
          id: clients.value.length + 1
        };
        
        // Добавляем нового клиента в список
        clients.value.push(newClientWithId);
        
        // Устанавливаем ID нового клиента в форму
        form.clientId = newClientWithId.id;
        
        // Закрываем модальное окно
        showNewClientModal.value = false;
        
        // Очищаем форму создания клиента
        newClient.name = '';
        newClient.phone = '';
        newClient.email = '';
      } catch (error) {
        console.error('Error saving client:', error);
        store.dispatch('setError', 'Ошибка при сохранении клиента');
      }
    };
    
    return {
      isEditMode,
      form,
      clients,
      branches,
      services,
      specialists,
      loading,
      calculatedEndTime,
      showNewClientModal,
      newClient,
      saveAppointment,
      updateDuration,
      updateEndTime,
      saveNewClient
    };
  }
};
</script> 