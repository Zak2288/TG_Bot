<template>
  <div class="clients-list">
    <div class="page-header">
      <h1>Clients</h1>
      <div class="header-actions">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search clients..."
            @input="handleSearch"
          >
          <i class="fas fa-search"></i>
        </div>
        <button class="btn btn-primary" @click="showAddModal = true">
          <i class="fas fa-plus"></i> Add Client
        </button>
      </div>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>Status</label>
        <select v-model="filters.status" @change="handleFilter">
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Sort By</label>
        <select v-model="filters.sortBy" @change="handleSort">
          <option value="name">Name</option>
          <option value="last_visit">Last Visit</option>
          <option value="total_spent">Total Spent</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Loading clients...
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i> {{ error }}
    </div>

    <div v-else class="clients-grid">
      <div v-for="client in filteredClients" :key="client.id" class="client-card">
        <div class="client-header">
          <h3>{{ client.name }}</h3>
          <span :class="['status-badge', client.status]">
            {{ client.status }}
          </span>
        </div>
        <div class="client-info">
          <p><i class="fas fa-phone"></i> {{ client.phone }}</p>
          <p><i class="fas fa-envelope"></i> {{ client.email }}</p>
          <p><i class="fas fa-calendar"></i> Last visit: {{ formatDate(client.last_visit) }}</p>
          <p><i class="fas fa-dollar-sign"></i> Total spent: ${{ client.total_spent }}</p>
        </div>
        <div class="client-actions">
          <button class="btn btn-sm btn-info" @click="viewClient(client.id)">
            <i class="fas fa-eye"></i> View
          </button>
          <button class="btn btn-sm btn-primary" @click="editClient(client)">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-sm btn-danger" @click="deleteClient(client.id)">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Client Modal -->
    <Modal v-if="showAddModal || showEditModal" @close="closeModal">
      <template #header>
        <h3>{{ showEditModal ? 'Edit Client' : 'Add New Client' }}</h3>
      </template>
      <template #body>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Name</label>
            <input type="text" v-model="clientForm.name" required>
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" v-model="clientForm.phone" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="clientForm.email">
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="clientForm.status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="clientForm.notes"></textarea>
          </div>
        </form>
      </template>
      <template #footer>
        <button class="btn btn-secondary" @click="closeModal">Cancel</button>
        <button class="btn btn-primary" @click="handleSubmit">Save</button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Modal from '@/components/Modal.vue'
import { format } from 'date-fns'

export default {
  name: 'ClientsList',
  components: {
    Modal
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    const clients = ref([])
    const loading = ref(true)
    const error = ref(null)
    const searchQuery = ref('')
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const currentClientId = ref(null)
    const filters = ref({
      status: '',
      sortBy: 'name'
    })

    const clientForm = ref({
      name: '',
      phone: '',
      email: '',
      status: 'active',
      notes: ''
    })

    const filteredClients = computed(() => {
      let result = [...clients.value]

      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(client => 
          client.name.toLowerCase().includes(query) ||
          client.phone.includes(query) ||
          client.email.toLowerCase().includes(query)
        )
      }

      // Apply status filter
      if (filters.value.status) {
        result = result.filter(client => client.status === filters.value.status)
      }

      // Apply sorting
      result.sort((a, b) => {
        switch (filters.value.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'last_visit':
            return new Date(b.last_visit) - new Date(a.last_visit)
          case 'total_spent':
            return b.total_spent - a.total_spent
          default:
            return 0
        }
      })

      return result
    })

    async function fetchClients() {
      try {
        loading.value = true
        clients.value = await store.dispatch('fetchClients')
      } catch (err) {
        error.value = 'Failed to load clients'
        console.error('Error fetching clients:', err)
      } finally {
        loading.value = false
      }
    }

    function formatDate(date) {
      return date ? format(new Date(date), 'PPP') : 'Never'
    }

    function handleSearch() {
      // Search is handled by the computed property
    }

    function handleFilter() {
      // Filtering is handled by the computed property
    }

    function handleSort() {
      // Sorting is handled by the computed property
    }

    function viewClient(id) {
      router.push(`/clients/${id}`)
    }

    function editClient(client) {
      currentClientId.value = client.id
      clientForm.value = { ...client }
      showEditModal.value = true
    }

    async function deleteClient(id) {
      if (confirm('Are you sure you want to delete this client?')) {
        try {
          await store.dispatch('deleteClient', id)
          await fetchClients()
        } catch (err) {
          console.error('Error deleting client:', err)
        }
      }
    }

    function closeModal() {
      showAddModal.value = false
      showEditModal.value = false
      currentClientId.value = null
      clientForm.value = {
        name: '',
        phone: '',
        email: '',
        status: 'active',
        notes: ''
      }
    }

    async function handleSubmit() {
      try {
        if (showEditModal.value) {
          await store.dispatch('updateClient', {
            id: currentClientId.value,
            ...clientForm.value
          })
        } else {
          await store.dispatch('createClient', clientForm.value)
        }
        closeModal()
        await fetchClients()
      } catch (err) {
        console.error('Error saving client:', err)
      }
    }

    onMounted(() => {
      fetchClients()
    })

    return {
      clients,
      loading,
      error,
      searchQuery,
      showAddModal,
      showEditModal,
      filters,
      clientForm,
      filteredClients,
      formatDate,
      handleSearch,
      handleFilter,
      handleSort,
      viewClient,
      editClient,
      deleteClient,
      closeModal,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.clients-list {
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
  align-items: center;
}

.search-box {
  position: relative;
}

.search-box input {
  padding: 0.5rem 2rem 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  width: 300px;
}

.search-box i {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  color: var(--text-secondary);
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.client-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.client-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.client-header h3 {
  margin: 0;
  font-size: 1.25rem;
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

.client-info {
  margin-bottom: 1rem;
}

.client-info p {
  margin: 0.5rem 0;
  color: var(--text-secondary);
}

.client-info i {
  width: 1.25rem;
  margin-right: 0.5rem;
}

.client-actions {
  display: flex;
  gap: 0.5rem;
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

.form-group input,
.form-group select,
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