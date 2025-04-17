<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="refreshData">
          <i class="fas fa-sync-alt"></i> Refresh
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
          <h3>Today's Appointments</h3>
          <p class="stat-value">{{ stats.todayAppointments }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-user-plus"></i>
        </div>
        <div class="stat-content">
          <h3>New Clients</h3>
          <p class="stat-value">{{ stats.newClients }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="stat-content">
          <h3>Monthly Sales</h3>
          <p class="stat-value">${{ stats.monthlySales }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-bell"></i>
        </div>
        <div class="stat-content">
          <h3>Unread Notifications</h3>
          <p class="stat-value">{{ stats.unreadNotifications }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <!-- Calendar Section -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2>Calendar</h2>
          <div class="calendar-actions">
            <button class="btn btn-outline-primary" @click="showAddAppointmentModal">
              <i class="fas fa-plus"></i> Add Appointment
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
          <h2>Recent Appointments</h2>
          <router-link to="/appointments" class="btn btn-link">
            View All
          </router-link>
        </div>
        <div class="appointments-list">
          <div v-if="recentAppointments.length === 0" class="empty-state">
            <p>No recent appointments</p>
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
                  {{ appointment.status }}
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
        <h3>Add New Appointment</h3>
      </template>
      <template #body>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Client</label>
            <select v-model="newAppointment.client_id" required>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Service</label>
            <select v-model="newAppointment.service_id" required>
              <option v-for="service in services" :key="service.id" :value="service.id">
                {{ service.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Date and Time</label>
            <input type="datetime-local" v-model="newAppointment.start_time" required>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="newAppointment.notes"></textarea>
          </div>
        </form>
      </template>
      <template #footer>
        <button class="btn btn-secondary" @click="showModal = false">Cancel</button>
        <button class="btn btn-primary" @click="handleSubmit">Save</button>
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
      eventResize: handleEventResize
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
      refreshData
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  margin-right: 1rem;
  color: var(--primary-color);
}

.stat-content h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.dashboard-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.calendar-container {
  height: 600px;
}

.appointments-list {
  max-height: 600px;
  overflow-y: auto;
}

.appointment-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.appointment-time {
  min-width: 100px;
  text-align: center;
}

.time {
  display: block;
  font-weight: bold;
  font-size: 1.1rem;
}

.date {
  display: block;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.appointment-details {
  flex: 1;
  margin: 0 1rem;
}

.appointment-details h4 {
  margin: 0 0 0.5rem;
}

.appointment-details p {
  margin: 0;
  color: var(--text-secondary);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.status-badge.scheduled {
  background: var(--info-light);
  color: var(--info);
}

.status-badge.completed {
  background: var(--success-light);
  color: var(--success);
}

.status-badge.cancelled {
  background: var(--danger-light);
  color: var(--danger);
}

.appointment-actions {
  margin-left: auto;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}
</style> 