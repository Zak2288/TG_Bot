<template>
  <div class="branch-details">
    <div class="page-header">
      <h1>Branch Details</h1>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="goBack">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        <button class="btn btn-primary" @click="editBranch">
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
              <label>Branch Name</label>
              <p>{{ branch.name }}</p>
            </div>
            <div class="info-item">
              <label>Status</label>
              <span :class="['status-badge', branch.status]">
                {{ branch.status }}
              </span>
            </div>
            <div class="info-item">
              <label>Address</label>
              <p>{{ branch.address }}</p>
            </div>
            <div class="info-item">
              <label>Phone</label>
              <p>{{ branch.phone }}</p>
            </div>
            <div class="info-item">
              <label>Email</label>
              <p>{{ branch.email || 'Not specified' }}</p>
            </div>
            <div class="info-item">
              <label>Manager</label>
              <p>{{ branch.manager_name }}</p>
            </div>
            <div class="info-item">
              <label>Working Hours</label>
              <p>{{ branch.opening_time }} - {{ branch.closing_time }}</p>
            </div>
          </div>
        </div>

        <div class="details-section">
          <h2>Description</h2>
          <p v-if="branch.description">{{ branch.description }}</p>
          <p v-else class="text-muted">No description available</p>
        </div>

        <div class="details-section">
          <h2>Branch Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ stats.employeesCount }}</div>
              <div class="stat-label">Employees</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats.servicesCount }}</div>
              <div class="stat-label">Services</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats.appointmentsCount }}</div>
              <div class="stat-label">Appointments This Month</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${{ stats.revenue }}</div>
              <div class="stat-label">Monthly Revenue</div>
            </div>
          </div>
        </div>

        <div class="details-section">
          <h2>Actions</h2>
          <div class="action-buttons">
            <button 
              v-if="branch.status === 'active'"
              class="btn btn-warning"
              @click="toggleBranchStatus"
            >
              <i class="fas fa-pause"></i> Disable Branch
            </button>
            <button 
              v-else
              class="btn btn-success"
              @click="toggleBranchStatus"
            >
              <i class="fas fa-play"></i> Enable Branch
            </button>
            <button 
              class="btn btn-primary"
              @click="manageEmployees"
            >
              <i class="fas fa-users"></i> Manage Employees
            </button>
            <button 
              class="btn btn-danger"
              @click="confirmDelete"
            >
              <i class="fas fa-trash"></i> Delete Branch
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
      <template #header>
        <h3>Confirm Delete</h3>
      </template>
      <template #body>
        <p>Are you sure you want to delete this branch? This action cannot be undone.</p>
        <p>Branch: <strong>{{ branch.name }}</strong></p>
        <p class="warning">All employees, services, and appointments associated with this branch will be affected.</p>
      </template>
      <template #footer>
        <button class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
        <button class="btn btn-danger" @click="deleteBranch">Delete</button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Modal from '@/components/Modal.vue'

export default {
  name: 'BranchDetails',
  components: {
    Modal
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const branch = ref({})
    const loading = ref(true)
    const error = ref(null)
    const showDeleteModal = ref(false)
    const stats = ref({
      employeesCount: 0,
      servicesCount: 0,
      appointmentsCount: 0,
      revenue: 0
    })

    async function fetchBranchDetails() {
      try {
        loading.value = true
        const branchData = await store.dispatch('fetchBranch', route.params.id)
        branch.value = branchData || {}
        
        // For demo purposes, generate some random stats
        // In a real app, these would come from the backend
        stats.value = {
          employeesCount: Math.floor(Math.random() * 20) + 1,
          servicesCount: Math.floor(Math.random() * 30) + 5,
          appointmentsCount: Math.floor(Math.random() * 100) + 10,
          revenue: Math.floor(Math.random() * 10000) + 1000
        }
      } catch (err) {
        error.value = 'Failed to load branch details'
        console.error('Error fetching branch:', err)
      } finally {
        loading.value = false
      }
    }

    function goBack() {
      router.back()
    }

    function editBranch() {
      router.push(`/branches/${route.params.id}/edit`)
    }

    function manageEmployees() {
      // In a real app, this would navigate to an employees management page
      // for this specific branch
      router.push(`/branches/${route.params.id}/employees`)
    }

    async function toggleBranchStatus() {
      try {
        loading.value = true
        const newStatus = branch.value.status === 'active' ? 'inactive' : 'active'
        await store.dispatch('updateBranch', {
          id: route.params.id,
          status: newStatus
        })
        branch.value.status = newStatus
      } catch (err) {
        error.value = 'Failed to update branch status'
        console.error('Error updating branch status:', err)
      } finally {
        loading.value = false
      }
    }

    function confirmDelete() {
      showDeleteModal.value = true
    }

    async function deleteBranch() {
      try {
        loading.value = true
        await store.dispatch('deleteBranch', route.params.id)
        showDeleteModal.value = false
        router.push('/branches')
      } catch (err) {
        error.value = 'Failed to delete branch'
        console.error('Error deleting branch:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchBranchDetails()
    })

    return {
      branch,
      loading,
      error,
      stats,
      showDeleteModal,
      goBack,
      editBranch,
      manageEmployees,
      toggleBranchStatus,
      confirmDelete,
      deleteBranch
    }
  }
}
</script>

<style scoped>
.branch-details {
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

.details-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.details-section {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.details-section:last-child {
  border-bottom: none;
}

.details-section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.info-item p {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: var(--success-light);
  color: var(--success);
}

.status-badge.inactive {
  background-color: var(--warning-light);
  color: var(--warning);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background-color: var(--primary-light);
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
}

.loading-state i,
.error-state i {
  margin-right: 0.5rem;
}

.error-state {
  color: var(--danger);
}

.text-muted {
  color: var(--text-secondary);
  font-style: italic;
}

.warning {
  color: var(--warning);
  font-weight: 500;
}
</style> 