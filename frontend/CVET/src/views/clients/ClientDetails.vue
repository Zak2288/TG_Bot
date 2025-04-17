<template>
  <div class="client-details">
    <div class="page-header">
      <h1>Client Details</h1>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="goBack">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        <button class="btn btn-primary" @click="editClient">
          <i class="fas fa-edit"></i> Edit
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Loading...
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i> {{ error }}
    </div>

    <div v-else class="details-content">
      <div class="details-grid">
        <!-- Client Information -->
        <div class="details-card">
          <div class="card-header">
            <h2>Client Information</h2>
            <span :class="['status-badge', client.status]">
              {{ client.status }}
            </span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>Name</label>
              <p>{{ client.name }}</p>
            </div>
            <div class="info-item">
              <label>Phone</label>
              <p>{{ client.phone }}</p>
            </div>
            <div class="info-item">
              <label>Email</label>
              <p>{{ client.email || 'Not provided' }}</p>
            </div>
            <div class="info-item">
              <label>Registration Date</label>
              <p>{{ formatDate(client.created_at) }}</p>
            </div>
            <div class="info-item">
              <label>Last Visit</label>
              <p>{{ formatDate(client.last_visit) || 'Never' }}</p>
            </div>
            <div class="info-item">
              <label>Total Spent</label>
              <p>${{ client.total_spent || '0' }}</p>
            </div>
          </div>
          <div class="notes-section" v-if="client.notes">
            <h3>Notes</h3>
            <p>{{ client.notes }}</p>
          </div>
        </div>

        <!-- Recent Appointments -->
        <div class="details-card">
          <div class="card-header">
            <h2>Recent Appointments</h2>
            <button class="btn btn-sm btn-primary" @click="scheduleAppointment">
              <i class="fas fa-plus"></i> Schedule
            </button>
          </div>
          <div v-if="appointments.length === 0" class="empty-state">
            <p>No appointments found</p>
          </div>
          <div v-else class="appointments-list">
            <div v-for="appointment in appointments" :key="appointment.id" class="appointment-item">
              <div class="appointment-info">
                <h4>{{ appointment.service_name }}</h4>
                <p>{{ formatDateTime(appointment.start_time) }}</p>
                <span :class="['status-badge', appointment.status.toLowerCase()]">
                  {{ appointment.status }}
                </span>
              </div>
              <div class="appointment-actions">
                <button class="btn btn-sm btn-info" @click="viewAppointment(appointment.id)">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Client History -->
        <div class="details-card">
          <div class="card-header">
            <h2>Client History</h2>
          </div>
          <div class="history-timeline">
            <div v-for="(event, index) in clientHistory" :key="index" class="timeline-item">
              <div class="timeline-date">{{ formatDate(event.date) }}</div>
              <div class="timeline-content">
                <h4>{{ event.title }}</h4>
                <p>{{ event.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { format, parseISO } from 'date-fns'

export default {
  name: 'ClientDetails',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const client = ref({})
    const appointments = ref([])
    const clientHistory = ref([])
    const loading = ref(true)
    const error = ref(null)

    async function fetchClientDetails() {
      try {
        loading.value = true
        const [clientData, appointmentsData] = await Promise.all([
          store.dispatch('fetchClientById', route.params.id),
          store.dispatch('fetchClientAppointments', route.params.id)
        ])
        
        client.value = clientData
        appointments.value = appointmentsData
        clientHistory.value = generateClientHistory(clientData, appointmentsData)
      } catch (err) {
        error.value = 'Failed to load client details'
        console.error('Error fetching client details:', err)
      } finally {
        loading.value = false
      }
    }

    function formatDate(date) {
      return date ? format(parseISO(date), 'PPP') : 'Never'
    }

    function formatDateTime(dateTime) {
      return format(parseISO(dateTime), 'PPP p')
    }

    function generateClientHistory(client, appointments) {
      const history = []
      
      // Add registration event
      history.push({
        date: client.created_at,
        title: 'Client Registration',
        description: 'Client was registered in the system'
      })

      // Add appointment events
      appointments.forEach(appointment => {
        history.push({
          date: appointment.start_time,
          title: `Appointment: ${appointment.service_name}`,
          description: `Status: ${appointment.status}`
        })
      })

      // Sort by date descending
      return history.sort((a, b) => new Date(b.date) - new Date(a.date))
    }

    function goBack() {
      router.push('/clients')
    }

    function editClient() {
      router.push(`/clients/${route.params.id}/edit`)
    }

    function viewAppointment(id) {
      router.push(`/appointments/${id}`)
    }

    function scheduleAppointment() {
      router.push({
        path: '/appointments/create',
        query: { client_id: route.params.id }
      })
    }

    onMounted(() => {
      fetchClientDetails()
    })

    return {
      client,
      appointments,
      clientHistory,
      loading,
      error,
      formatDate,
      formatDateTime,
      goBack,
      editClient,
      viewAppointment,
      scheduleAppointment
    }
  }
}
</script>

<style scoped>
.client-details {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.details-content {
  max-width: 1200px;
  margin: 0 auto;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.details-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item label {
  display: block;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.info-item p {
  margin: 0;
  font-size: 1.1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.status-badge.active {
  background: var(--success-light);
  color: var(--success);
}

.status-badge.inactive {
  background: var(--danger-light);
  color: var(--danger);
}

.notes-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.notes-section h3 {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.appointment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.appointment-info h4 {
  margin: 0 0 0.5rem 0;
}

.appointment-info p {
  margin: 0;
  color: var(--text-secondary);
}

.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.timeline-item {
  display: flex;
  gap: 1rem;
}

.timeline-date {
  min-width: 150px;
  color: var(--text-secondary);
}

.timeline-content h4 {
  margin: 0 0 0.5rem 0;
}

.timeline-content p {
  margin: 0;
  color: var(--text-secondary);
}

.loading-state,
.error-state {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
}

.loading-state i {
  margin-right: 0.5rem;
}

.error-state {
  color: var(--danger);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}
</style> 