<template>
  <div class="appointment-details">
    <div class="page-header">
      <h1>Appointment Details</h1>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="goBack">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        <button class="btn btn-primary" @click="editAppointment">
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
      <div class="details-card">
        <div class="details-section">
          <h2>Basic Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Client</label>
              <p>{{ appointment.client_name }}</p>
            </div>
            <div class="info-item">
              <label>Service</label>
              <p>
                {{ appointment.service_name }}
                <span 
                  v-if="isIrisService(appointment)" 
                  class="iris-badge" 
                  title="Запись на диагностику радужки"
                >👁️</span>
              </p>
            </div>
            <div class="info-item">
              <label>Date & Time</label>
              <p>{{ formatDateTime(appointment.start_time) }}</p>
            </div>
            <div class="info-item">
              <label>Duration</label>
              <p>{{ appointment.duration }} minutes</p>
            </div>
            <div class="info-item">
              <label>Status</label>
              <span :class="['status-badge', appointment.status.toLowerCase()]">
                {{ appointment.status }}
              </span>
            </div>
            <div class="info-item">
              <label>Price</label>
              <p>${{ appointment.price }}</p>
            </div>
          </div>
        </div>

        <div class="details-section">
          <h2>Notes</h2>
          <p v-if="appointment.notes">{{ appointment.notes }}</p>
          <p v-else class="text-muted">No notes available</p>
        </div>

        <div class="details-section">
          <h2>Actions</h2>
          <div class="action-buttons">
            <button 
              v-if="appointment.status === 'SCHEDULED'"
              class="btn btn-primary"
              @click="confirmAppointment"
            >
              <i class="fas fa-check"></i> Подтвердить запись
            </button>
            <button 
              v-if="appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED'"
              class="btn btn-success"
              @click="markAsCompleted"
            >
              <i class="fas fa-check-double"></i> Отметить как завершенную
            </button>
            <button 
              v-if="appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED'"
              class="btn btn-warning"
              @click="markAsNoShow"
            >
              <i class="fas fa-user-slash"></i> Клиент не явился
            </button>
            <button 
              v-if="appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && appointment.status !== 'NO_SHOW'"
              class="btn btn-danger"
              @click="cancelAppointment"
            >
              <i class="fas fa-times"></i> Отменить запись
            </button>
            <button 
              class="btn btn-info"
              @click="sendReminder"
            >
              <i class="fas fa-bell"></i> Отправить напоминание
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <Modal v-if="showEditModal" @close="showEditModal = false">
      <template #header>
        <h3>Edit Appointment</h3>
      </template>
      <template #body>
        <form @submit.prevent="handleUpdate">
          <div class="form-group">
            <label>Client</label>
            <select v-model="editForm.client_id" required>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Service</label>
            <select v-model="editForm.service_id" required>
              <option v-for="service in services" :key="service.id" :value="service.id">
                {{ service.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Date and Time</label>
            <input type="datetime-local" v-model="editForm.start_time" required>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="editForm.notes"></textarea>
          </div>
        </form>
      </template>
      <template #footer>
        <button class="btn btn-secondary" @click="showEditModal = false">Cancel</button>
        <button class="btn btn-primary" @click="handleUpdate">Save Changes</button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Modal from '@/components/Modal.vue'
import { format, parseISO } from 'date-fns'

export default {
  name: 'AppointmentDetails',
  components: {
    Modal
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const appointment = ref({})
    const loading = ref(true)
    const error = ref(null)
    const showEditModal = ref(false)
    const clients = ref([])
    const services = ref([])
    const editForm = ref({
      client_id: '',
      service_id: '',
      start_time: '',
      notes: ''
    })

    async function fetchAppointmentDetails() {
      try {
        loading.value = true
        const [appointmentData, clientsData, servicesData] = await Promise.all([
          store.dispatch('fetchAppointmentById', route.params.id),
          store.dispatch('fetchClients'),
          store.dispatch('fetchServices')
        ])
        
        appointment.value = appointmentData
        clients.value = clientsData
        services.value = servicesData
        editForm.value = {
          client_id: appointmentData.client_id,
          service_id: appointmentData.service_id,
          start_time: appointmentData.start_time,
          notes: appointmentData.notes
        }
      } catch (err) {
        error.value = 'Failed to load appointment details'
        console.error('Error fetching appointment:', err)
      } finally {
        loading.value = false
      }
    }

    function formatDateTime(dateTime) {
      return format(parseISO(dateTime), 'PPP p')
    }

    function goBack() {
      router.back()
    }

    function editAppointment() {
      showEditModal.value = true
    }

    async function handleUpdate() {
      try {
        await store.dispatch('updateAppointment', {
          id: route.params.id,
          ...editForm.value
        })
        showEditModal.value = false
        await fetchAppointmentDetails()
      } catch (err) {
        console.error('Error updating appointment:', err)
      }
    }

    async function markAsCompleted() {
      try {
        await store.dispatch('updateAppointmentStatus', {
          id: route.params.id,
          status: 'COMPLETED'
        })
        await fetchAppointmentDetails()
      } catch (err) {
        console.error('Error marking appointment as completed:', err)
      }
    }

    async function cancelAppointment() {
      try {
        const reason = prompt('Укажите причину отмены записи:')
        
        await store.dispatch('updateAppointmentStatus', {
          id: route.params.id,
          status: 'CANCELLED',
          reason: reason || undefined
        })
        await fetchAppointmentDetails()
      } catch (err) {
        console.error('Error cancelling appointment:', err)
      }
    }

    async function sendReminder() {
      try {
        await store.dispatch('sendAppointmentReminder', route.params.id)
        // Show success message
      } catch (err) {
        console.error('Error sending reminder:', err)
      }
    }

    async function confirmAppointment() {
      try {
        await store.dispatch('updateAppointmentStatus', {
          id: route.params.id,
          status: 'CONFIRMED'
        })
        await fetchAppointmentDetails()
      } catch (err) {
        console.error('Error confirming appointment:', err)
      }
    }

    async function markAsNoShow() {
      try {
        await store.dispatch('updateAppointmentStatus', {
          id: route.params.id,
          status: 'NO_SHOW'
        })
        await fetchAppointmentDetails()
      } catch (err) {
        console.error('Error marking appointment as no-show:', err)
      }
    }

    function isIrisService(appointment) {
      return appointment.service_name?.toLowerCase().includes('радужк');
    }

    onMounted(() => {
      fetchAppointmentDetails()
    })

    return {
      appointment,
      loading,
      error,
      showEditModal,
      clients,
      services,
      editForm,
      formatDateTime,
      goBack,
      editAppointment,
      handleUpdate,
      markAsCompleted,
      cancelAppointment,
      sendReminder,
      confirmAppointment,
      markAsNoShow,
      isIrisService
    }
  }
}
</script>

<style scoped>
.appointment-details {
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
  max-width: 800px;
  margin: 0 auto;
}

.details-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.details-section {
  margin-bottom: 2rem;
}

.details-section:last-child {
  margin-bottom: 0;
}

.details-section h2 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
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

.action-buttons {
  display: flex;
  gap: 1rem;
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

.iris-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  color: #00708f;
  font-size: 16px;
}
</style> 