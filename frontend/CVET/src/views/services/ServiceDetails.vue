<template>
  <div class="service-details">
    <div class="page-header">
      <h1>Service Details</h1>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="goBack">
          <i class="fas fa-arrow-left"></i> Back to Services
        </button>
        <button class="btn btn-primary" @click="editService">
          <i class="fas fa-edit"></i> Edit Service
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Loading...
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i> {{ error }}
    </div>

    <div v-else class="details-container">
      <div class="details-card">
        <div class="details-header">
          <h2>{{ service.name }}</h2>
          <span :class="['status-badge', service.status]">
            {{ service.status }}
          </span>
        </div>

        <div class="details-content">
          <div class="detail-item">
            <label>Category:</label>
            <span>{{ service.category }}</span>
          </div>

          <div class="detail-item">
            <label>Price:</label>
            <span>${{ service.price.toFixed(2) }}</span>
          </div>

          <div class="detail-item">
            <label>Duration:</label>
            <span>{{ service.duration }} minutes</span>
          </div>

          <div class="detail-item">
            <label>Description:</label>
            <p>{{ service.description || 'No description provided' }}</p>
          </div>

          <div class="detail-item">
            <label>Created At:</label>
            <span>{{ formatDate(service.createdAt) }}</span>
          </div>

          <div class="detail-item">
            <label>Last Updated:</label>
            <span>{{ formatDate(service.updatedAt) }}</span>
          </div>
        </div>

        <div class="details-actions">
          <button 
            class="btn btn-danger" 
            @click="confirmDelete"
            :disabled="loading"
          >
            <i class="fas fa-trash"></i> Delete Service
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete this service? This action cannot be undone.</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteModal = false">
            Cancel
          </button>
          <button 
            class="btn btn-danger" 
            @click="deleteService"
            :disabled="loading"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'ServiceDetails',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const loading = ref(false)
    const error = ref(null)
    const service = ref({})
    const showDeleteModal = ref(false)

    async function fetchService() {
      try {
        loading.value = true
        const fetchedService = await store.dispatch('fetchService', route.params.id)
        if (fetchedService) {
          service.value = fetchedService
        } else {
          error.value = 'Service not found'
        }
      } catch (err) {
        error.value = 'Failed to load service'
        console.error('Error fetching service:', err)
      } finally {
        loading.value = false
      }
    }

    function formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    function goBack() {
      router.push('/services')
    }

    function editService() {
      router.push(`/services/${route.params.id}/edit`)
    }

    function confirmDelete() {
      showDeleteModal.value = true
    }

    async function deleteService() {
      try {
        loading.value = true
        await store.dispatch('deleteService', route.params.id)
        router.push('/services')
      } catch (err) {
        error.value = 'Failed to delete service'
        console.error('Error deleting service:', err)
      } finally {
        loading.value = false
        showDeleteModal.value = false
      }
    }

    onMounted(() => {
      fetchService()
    })

    return {
      loading,
      error,
      service,
      showDeleteModal,
      formatDate,
      goBack,
      editService,
      confirmDelete,
      deleteService
    }
  }
}
</script>

<style scoped>
.service-details {
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

.details-container {
  max-width: 800px;
  margin: 0 auto;
}

.details-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #e6f4ea;
  color: #1e7e34;
}

.status-badge.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.detail-item {
  margin-bottom: 1.5rem;
}

.detail-item label {
  display: block;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
}

.detail-item span {
  color: #333;
}

.detail-item p {
  margin: 0;
  color: #333;
  line-height: 1.5;
}

.details-actions {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  text-align: right;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.modal p {
  margin-bottom: 2rem;
  color: #666;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error-state {
  color: #dc3545;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style> 