<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Панель управления</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="refreshData">
          <i class="fas fa-sync-alt"></i> Обновить
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <h3>Записи на сегодня</h3>
          <p class="stat-value">{{ stats.todayAppointments }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-user-plus"></i>
        </div>
        <div class="stat-content">
          <h3>Новые клиенты</h3>
          <p class="stat-value">{{ stats.newClients }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="stat-content">
          <h3>Ежемесячные продажи</h3>
          <p class="stat-value">₽{{ stats.monthlySales }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-bell"></i>
        </div>
        <div class="stat-content">
          <h3>Непрочитанные уведомления</h3>
          <p class="stat-value">{{ stats.unreadNotifications }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <!-- Calendar Section -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2>Календарь</h2>
          <div class="calendar-actions">
            <button class="btn btn-outline-primary" @click="showAddAppointmentModal">
              <i class="fas fa-plus"></i> Добавить запись
            </button>
          </div>
        </div>
        <div class="calendar-container">
          <FullCalendar
            :options="calendarOptions"
            ref="calendar"
          />
        </div>
      </div>

      <!-- Recent Appointments Section -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2>Последние записи</h2>
          <router-link to="/appointments" class="btn btn-link">
            Смотреть все
          </router-link>
        </div>
        <div class="appointments-list">
          <div v-if="recentAppointments.length === 0" class="empty-state">
            <p>Нет последних записей</p>
          </div>
          <div v-else class="appointment-items">
            <div v-for="appointment in recentAppointments" :key="appointment.id" class="appointment-item">
              <div class="appointment-time">
                <span class="time">{{ formatTime(appointment.start_time) }}</span>
                <span class="date">{{ formatDate(appointment.start_time) }}</span>
              </div>
              <div class="appointment-details">
                <h4>{{ appointment.client_name }}</h4>
                <p>{{ appointment.service_name }}</p>
                <span :class="['status-badge', appointment.status.toLowerCase()]">
                  {{ translateStatus(appointment.status) }}
                </span>
                <span v-if="appointment.source === 'TELEGRAM'" class="source-badge telegram">
                  <i class="fab fa-telegram"></i> Telegram
                </span>
              </div>
              <div class="appointment-actions">
                <button class="btn btn-icon" @click="viewAppointment(appointment.id)">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Appointment Modal -->
    <Modal v-if="showModal" @close="showModal = false">
      <template #header>
        <h3>Добавить новую запись</h3>
      </template>
      <template #body>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Клиент</label>
            <select v-model="newAppointment.client_id" required>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Услуга</label>
            <select v-model="newAppointment.service_id" required>
              <option v-for="service in services" :key="service.id" :value="service.id">
                {{ service.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Дата и время</label>
            <input type="datetime-local" v-model="newAppointment.start_time" required>
          </div>
          <div class="form-group">
            <label>Заметки</label>
            <textarea v-model="newAppointment.notes"></textarea>
          </div>
        </form>
      </template>
      <template #footer>
        <button class="btn btn-secondary" @click="showModal = false">Отмена</button>
        <button class="btn btn-primary" @click="handleSubmit">Сохранить</button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ruLocale from '@fullcalendar/core/locales/ru'
import Modal from '@/components/Modal.vue'
import { format, parseISO } from 'date-fns'

export default {
  name: 'Dashboard',
  components: {
    FullCalendar,
    Modal
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const calendar = ref(null)
    const showModal = ref(false)
    const stats = ref({
      todayAppointments: 0,
      newClients: 0,
      monthlySales: 0,
      unreadNotifications: 0
    })
    const recentAppointments = ref([])
    const clients = ref([])
    const services = ref([])
    const newAppointment = ref({
      client_id: '',
      service_id: '',
      start_time: '',
      notes: ''
    })

    const calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      weekends: true,
      select: handleDateSelect,
      eventClick: handleEventClick,
      eventsSet: handleEvents,
      eventDrop: handleEventDrop,
      eventResize: handleEventResize,
      locale: ruLocale,
      buttonText: {
        today: 'Сегодня',
        month: 'Месяц',
        week: 'Неделя',
        day: 'День'
      },
      firstDay: 1
    }

    async function fetchDashboardData() {
      try {
        const [statsData, appointmentsData, clientsData, servicesData] = await Promise.all([
          store.dispatch('fetchDashboardStats'),
          store.dispatch('fetchRecentAppointments'),
          store.dispatch('fetchClients'),
          store.dispatch('fetchServices')
        ])

        stats.value = statsData
        recentAppointments.value = appointmentsData
        clients.value = clientsData
        services.value = servicesData
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    function formatTime(dateTime) {
      return format(parseISO(dateTime), 'hh:mm a')
    }

    function formatDate(dateTime) {
      return format(parseISO(dateTime), 'MMM d, yyyy')
    }

    function showAddAppointmentModal() {
      showModal.value = true
    }

    async function handleSubmit() {
      try {
        await store.dispatch('createAppointment', newAppointment.value)
        showModal.value = false
        await fetchDashboardData()
      } catch (error) {
        console.error('Error creating appointment:', error)
      }
    }

    function viewAppointment(id) {
      router.push(`/appointments/${id}`)
    }

    function handleDateSelect(selectInfo) {
      newAppointment.value.start_time = selectInfo.startStr
      showAddAppointmentModal()
    }

    function handleEventClick(clickInfo) {
      viewAppointment(clickInfo.event.id)
    }

    function handleEvents(events) {
      // Handle calendar events
    }

    async function handleEventDrop(dropInfo) {
      try {
        await store.dispatch('updateAppointment', {
          id: dropInfo.event.id,
          start_time: dropInfo.event.startStr
        })
      } catch (error) {
        console.error('Error updating appointment:', error)
      }
    }

    async function handleEventResize(resizeInfo) {
      try {
        await store.dispatch('updateAppointment', {
          id: resizeInfo.event.id,
          end_time: resizeInfo.event.endStr
        })
      } catch (error) {
        console.error('Error updating appointment:', error)
      }
    }

    function refreshData() {
      fetchDashboardData()
    }

    function translateStatus(status) {
      const statusMap = {
        'Scheduled': 'Запланировано',
        'Completed': 'Завершено',
        'Canceled': 'Отменено',
        'No-show': 'Неявка'
      };
      return statusMap[status] || status;
    }

    onMounted(() => {
      fetchDashboardData()
    })

    return {
      stats,
      recentAppointments,
      clients,
      services,
      newAppointment,
      calendarOptions,
      showModal,
      formatTime,
      formatDate,
      showAddAppointmentModal,
      handleSubmit,
      viewAppointment,
      refreshData,
      translateStatus
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 0;
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  margin: 0;
  background-color: #f8f9fe;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  width: 100%;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.dashboard-header h1 {
  margin: 0;
  font-weight: 600;
  font-size: 1.8rem;
}

.btn-primary {
  background-color: white;
  color: #6a11cb;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 0 2rem 2rem;
  width: calc(100% - 4rem);
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 1.8rem;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-left: 5px solid transparent;
}

.stat-card:nth-child(1) {
  border-left-color: #11cdef;
}

.stat-card:nth-child(2) {
  border-left-color: #2dce89;
}

.stat-card:nth-child(3) {
  border-left-color: #fb6340;
}

.stat-card:nth-child(4) {
  border-left-color: #f5365c;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2.2rem;
  margin-right: 1.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-card:nth-child(1) .stat-icon {
  color: #11cdef;
  background-color: rgba(17, 205, 239, 0.1);
}

.stat-card:nth-child(2) .stat-icon {
  color: #2dce89;
  background-color: rgba(45, 206, 137, 0.1);
}

.stat-card:nth-child(3) .stat-icon {
  color: #fb6340;
  background-color: rgba(251, 99, 64, 0.1);
}

.stat-card:nth-child(4) .stat-icon {
  color: #f5365c;
  background-color: rgba(245, 54, 92, 0.1);
}

.stat-content h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #8898aa;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0.3rem 0 0;
  color: #32325d;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  padding: 0 2rem 2rem;
  width: calc(100% - 4rem);
}

.dashboard-section {
  background: white;
  border-radius: 15px;
  padding: 1.8rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.8rem;
  border-bottom: 1px solid #f5f5f5;
  padding-bottom: 1rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #32325d;
}

.btn-outline-primary {
  background-color: transparent;
  color: #5e72e4;
  border: 1px solid #5e72e4;
  padding: 0.5rem 1.2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline-primary:hover {
  background-color: #5e72e4;
  color: white;
}

.btn-link {
  color: #5e72e4;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-link:hover {
  text-decoration: underline;
}

.calendar-container {
  height: 650px;
}

.appointments-list {
  max-height: 650px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.appointment-item {
  display: flex;
  align-items: center;
  padding: 1.2rem;
  border-bottom: 1px solid #f5f5f5;
  transition: all 0.3s ease;
}

.appointment-item:hover {
  background-color: #f8f9fe;
}

.appointment-time {
  min-width: 100px;
  text-align: center;
}

.time {
  display: block;
  font-weight: bold;
  font-size: 1.1rem;
  color: #32325d;
}

.date {
  display: block;
  font-size: 0.9rem;
  color: #8898aa;
}

.appointment-details {
  flex: 1;
  margin: 0 1.2rem;
}

.appointment-details h4 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: #32325d;
}

.appointment-details p {
  margin: 0;
  color: #8898aa;
  font-size: 0.9rem;
}

.status-badge {
  display: inline-block;
  padding: 0.3rem 0.7rem;
  border-radius: 50px;
  font-size: 0.75rem;
  margin-top: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.scheduled {
  background: rgba(17, 205, 239, 0.1);
  color: #11cdef;
}

.status-badge.completed {
  background: rgba(45, 206, 137, 0.1);
  color: #2dce89;
}

.status-badge.cancelled {
  background: rgba(245, 54, 92, 0.1);
  color: #f5365c;
}

.status-badge.no-show {
  background: rgba(136, 152, 170, 0.1);
  color: #8898aa;
}

.appointment-actions {
  margin-left: auto;
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f8f9fe;
  color: #5e72e4;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background: #5e72e4;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #8898aa;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #32325d;
  font-size: 0.9rem;
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #32325d;
  transition: border-color 0.3s ease;
}

.form-group select:focus,
.form-group input:focus,
.form-group textarea:focus {
  border-color: #5e72e4;
  outline: none;
}

/* Стили для модального окна */
:deep(.modal-container) {
  border-radius: 15px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

:deep(.modal-header) {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  padding: 1.5rem;
}

:deep(.modal-header h3) {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

:deep(.modal-body) {
  padding: 1.5rem;
}

:deep(.modal-footer) {
  padding: 1.5rem;
  background-color: #f8f9fe;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

:deep(.modal-footer button) {
  padding: 0.6rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #8898aa;
  border: none;
}

.btn-secondary:hover {
  background-color: #e9ecef;
}

/* Улучшения для отображения календаря */
:deep(.fc) {
  font-family: 'Inter', system-ui, sans-serif;
}

:deep(.fc-toolbar-title) {
  font-size: 1.3rem !important;
  font-weight: 600;
  color: #32325d;
}

:deep(.fc-button) {
  border-radius: 50px !important;
  text-transform: capitalize !important;
  padding: 0.5rem 1.2rem !important;
  font-weight: 600 !important;
  box-shadow: none !important;
}

:deep(.fc-button-primary) {
  background-color: #5e72e4 !important;
  border-color: #5e72e4 !important;
}

:deep(.fc-button-primary:hover) {
  background-color: #4a5cd1 !important;
}

:deep(.fc-day-today) {
  background-color: rgba(94, 114, 228, 0.05) !important;
}

:deep(.fc-event) {
  border-radius: 6px !important;
  padding: 3px 6px !important;
  font-size: 0.8rem !important;
  border: none !important;
}

:deep(.fc-daygrid-day-number) {
  font-size: 0.9rem;
  font-weight: 500;
  color: #32325d;
}

:deep(.fc-col-header-cell-cushion) {
  font-weight: 600;
  color: #5e72e4;
  padding: 10px 0;
}

:deep(.fc-scrollgrid) {
  border-radius: 8px;
  overflow: hidden;
}

/* Медиа-запросы для адаптивности */
@media screen and (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

.source-badge.telegram {
  background-color: #0088cc;
  color: white;
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-flex;
  align-items: center;
  margin-left: 0.5rem;
}

.source-badge.telegram i {
  margin-right: 0.25rem;
}
</style> 