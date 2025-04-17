<template>
  <div>
    <header class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Записи клиентов</h1>
        <p class="mt-1 text-sm text-gray-600">Управление записями клиентов на услуги</p>
      </div>
      <router-link 
        to="/appointments/create" 
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Новая запись
      </router-link>
    </header>

    <!-- Фильтры -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div class="px-4 py-5 sm:p-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700">Дата</label>
            <input
              type="date"
              id="date"
              v-model="filters.date"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700">Статус</label>
            <select
              id="status"
              v-model="filters.status"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Все статусы</option>
              <option value="SCHEDULED">Запланирован</option>
              <option value="CONFIRMED">Подтвержден</option>
              <option value="COMPLETED">Завершен</option>
              <option value="CANCELLED">Отменен</option>
              <option value="NO_SHOW">Не явился</option>
            </select>
          </div>
          <div>
            <label for="branch" class="block text-sm font-medium text-gray-700">Филиал</label>
            <select
              id="branch"
              v-model="filters.branchId"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Все филиалы</option>
              <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                {{ branch.name }}
              </option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              type="button"
              @click="fetchAppointments"
              class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Календарь записей -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div class="px-4 py-5 sm:p-6">
        <div class="calendar-container" style="height: 500px;">
          <FullCalendar 
            ref="fullCalendar"
            :options="calendarOptions"
          />
        </div>
      </div>
    </div>

    <!-- Таблица записей -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Список записей</h3>
        <div class="flex items-center space-x-2">
          <select
            v-model="pagination.limit"
            @change="fetchAppointments"
            class="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span class="text-sm text-gray-500">на странице</span>
        </div>
      </div>
      <div v-if="loading" class="flex justify-center my-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
      <div v-else-if="appointments.length === 0" class="px-4 py-5 sm:p-6 text-center text-gray-500">
        Нет записей с выбранными параметрами
      </div>
      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Клиент
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Услуга
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата и время
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Филиал
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Источник
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="appointment in appointments" :key="appointment.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                        {{ getInitials(appointment.client.name) }}
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ appointment.client.name }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ appointment.client.phone }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ appointment.service.name }}</div>
                  <div class="text-sm text-gray-500">{{ appointment.service.price }} ₽</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatDate(appointment.startTime) }}</div>
                  <div class="text-sm text-gray-500">
                    {{ formatTime(appointment.startTime) }} - {{ formatTime(appointment.endTime) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ appointment.branch.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': appointment.status === 'COMPLETED',
                      'bg-yellow-100 text-yellow-800': appointment.status === 'SCHEDULED',
                      'bg-blue-100 text-blue-800': appointment.status === 'CONFIRMED',
                      'bg-red-100 text-red-800': appointment.status === 'CANCELLED' || appointment.status === 'NO_SHOW'
                    }"
                  >
                    {{ getStatusText(appointment.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getSourceText(appointment.source) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex space-x-2 justify-end">
                    <router-link
                      :to="`/appointments/${appointment.id}/edit`"
                      class="text-primary-600 hover:text-primary-900"
                    >
                      Изменить
                    </router-link>
                    <button
                      @click="confirmDelete(appointment)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Пагинация -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="prevPage"
              :disabled="pagination.page === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Предыдущая
            </button>
            <button
              @click="nextPage"
              :disabled="pagination.page * pagination.limit >= totalAppointments"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Следующая
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Показаны записи 
                <span class="font-medium">{{ ((pagination.page - 1) * pagination.limit) + 1 }}</span>
                -
                <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, totalAppointments) }}</span>
                из
                <span class="font-medium">{{ totalAppointments }}</span>
                результатов
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  @click="prevPage"
                  :disabled="pagination.page === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span class="sr-only">Предыдущая</span>
                  <!-- Heroicon name: solid/chevron-left -->
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  v-for="page in paginationPages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    page === pagination.page ? 'z-10 bg-primary-50 border-primary-500 text-primary-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="nextPage"
                  :disabled="pagination.page * pagination.limit >= totalAppointments"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span class="sr-only">Следующая</span>
                  <!-- Heroicon name: solid/chevron-right -->
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Удалить запись
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Вы уверены, что хотите удалить запись клиента 
                    <span class="font-semibold">{{ appointmentToDelete?.client?.name }}</span> 
                    на услугу <span class="font-semibold">{{ appointmentToDelete?.service?.name }}</span>?
                    Это действие нельзя отменить.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              @click="deleteAppointment"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Удалить
            </button>
            <button 
              type="button" 
              @click="cancelDelete"
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';

export default {
  name: 'AppointmentsList',
  components: {
    FullCalendar
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const fullCalendar = ref(null);
    
    // Состояния
    const loading = ref(false);
    const appointments = ref([]);
    const branches = ref([]);
    const totalAppointments = ref(0);
    const showDeleteModal = ref(false);
    const appointmentToDelete = ref(null);
    
    // Фильтры и пагинация
    const filters = reactive({
      date: new Date().toISOString().split('T')[0],
      status: '',
      branchId: ''
    });
    
    const pagination = reactive({
      page: 1,
      limit: 10
    });
    
    // Вычисляемые свойства
    const paginationPages = computed(() => {
      const totalPages = Math.ceil(totalAppointments.value / pagination.limit);
      if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      
      const currentPage = pagination.page;
      if (currentPage <= 3) {
        return [1, 2, 3, 4, 5];
      }
      
      if (currentPage >= totalPages - 2) {
        return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      }
      
      return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    });
    
    // Опции календаря
    const calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay'
      },
      locale: ruLocale,
      events: [],
      eventClick: function(info) {
        router.push(`/appointments/${info.event.id}/edit`);
      },
      dateClick: function(info) {
        filters.date = info.dateStr;
        fetchAppointments();
      }
    };
    
    // При монтировании компонента
    onMounted(async () => {
      await fetchBranches();
      await fetchAppointments();
    });
    
    // Методы загрузки данных
    const fetchAppointments = async () => {
      loading.value = true;
      try {
        const query = {
          ...filters,
          page: pagination.page,
          limit: pagination.limit
        };
        
        // Используем действие из модуля appointments Vuex
        const result = await store.dispatch('appointments/fetchAppointments', query);
        
        if (result && Array.isArray(result)) {
          appointments.value = result;
          totalAppointments.value = result.length;
        } else if (result && result.data && Array.isArray(result.data)) {
          appointments.value = result.data;
          totalAppointments.value = result.meta?.total || result.data.length;
        }
        
        // Обновление событий в календаре
        updateCalendarEvents();
      } catch (error) {
        console.error('Error fetching appointments:', error);
        store.dispatch('setError', 'Ошибка при получении записей', { root: true });
      } finally {
        loading.value = false;
      }
    };
    
    const fetchBranches = async () => {
      try {
        // Используем глобальное действие для получения филиалов
        const branchesData = await store.dispatch('fetchBranches');
        branches.value = branchesData;
      } catch (error) {
        console.error('Error fetching branches:', error);
        store.dispatch('setError', 'Ошибка при получении филиалов', { root: true });
      }
    };
    
    // Методы для пагинации
    const prevPage = () => {
      if (pagination.page > 1) {
        pagination.page--;
        fetchAppointments();
      }
    };
    
    const nextPage = () => {
      if (pagination.page * pagination.limit < totalAppointments.value) {
        pagination.page++;
        fetchAppointments();
      }
    };
    
    const goToPage = (page) => {
      if (page !== pagination.page) {
        pagination.page = page;
        fetchAppointments();
      }
    };
    
    // Методы для работы с календарем
    const updateCalendarEvents = () => {
      if (!fullCalendar.value) return;
      
      const calendarApi = fullCalendar.value.getApi();
      calendarApi.removeAllEvents();
      
      const events = appointments.value.map(appointment => ({
        id: appointment.id,
        title: `${appointment.client.name} - ${appointment.service.name}`,
        start: appointment.startTime,
        end: appointment.endTime,
        color: getStatusColor(appointment.status)
      }));
      
      calendarApi.addEventSource(events);
    };
    
    // Методы для работы с удалением
    const confirmDelete = (appointment) => {
      appointmentToDelete.value = appointment;
      showDeleteModal.value = true;
    };
    
    const cancelDelete = () => {
      appointmentToDelete.value = null;
      showDeleteModal.value = false;
    };
    
    const deleteAppointment = async () => {
      if (!appointmentToDelete.value) return;
      
      try {
        // Используем действие из модуля appointments Vuex
        await store.dispatch('appointments/deleteAppointment', appointmentToDelete.value.id);
        fetchAppointments();
        cancelDelete();
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    };
    
    // Вспомогательные функции
    const getInitials = (name) => {
      if (!name) return '';
      const nameParts = name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    };
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };
    
    const formatTime = (dateString) => {
      return new Date(dateString).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    const getStatusText = (status) => {
      const statusMap = {
        'SCHEDULED': 'Запланирован',
        'CONFIRMED': 'Подтвержден',
        'COMPLETED': 'Завершен',
        'CANCELLED': 'Отменен',
        'NO_SHOW': 'Не явился'
      };
      return statusMap[status] || status;
    };
    
    const getSourceText = (source) => {
      const sourceMap = {
        'WEBSITE': 'Веб-сайт',
        'VK': 'ВКонтакте',
        'TELEGRAM': 'Телеграм',
        'AVITO': 'Авито',
        'PHONE': 'Телефон',
        'OTHER': 'Другое'
      };
      return sourceMap[source] || source;
    };
    
    const getStatusColor = (status) => {
      const colorMap = {
        'SCHEDULED': '#EAB308', // yellow-500
        'CONFIRMED': '#3B82F6', // blue-500
        'COMPLETED': '#10B981', // green-500
        'CANCELLED': '#EF4444', // red-500
        'NO_SHOW': '#F43F5E' // rose-500
      };
      return colorMap[status] || '#6B7280'; // gray-500
    };
    
    return {
      loading,
      appointments,
      branches,
      filters,
      pagination,
      totalAppointments,
      paginationPages,
      calendarOptions,
      fullCalendar,
      showDeleteModal,
      appointmentToDelete,
      fetchAppointments,
      prevPage,
      nextPage,
      goToPage,
      confirmDelete,
      cancelDelete,
      deleteAppointment,
      getInitials,
      formatDate,
      formatTime,
      getStatusText,
      getSourceText
    };
  }
};
</script>

<style>
.calendar-container .fc-daygrid-event {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 