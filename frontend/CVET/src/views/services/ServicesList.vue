<template>
  <div class="services-list">
    <div class="page-header">
      <h1>Services</h1>
      <div class="header-actions">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search services..."
            @input="handleSearch"
          >
          <i class="fas fa-search"></i>
        </div>
        <button class="btn btn-primary" @click="showAddModal = true">
          <i class="fas fa-plus"></i> Add Service
        </button>
      </div>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>Category</label>
        <select v-model="filters.category" @change="handleFilter">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>Sort By</label>
        <select v-model="filters.sortBy" @change="handleSort">
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="duration">Duration</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Loading services...
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i> {{ error }}
    </div>

    <div v-else class="services-grid">
      <div v-for="service in filteredServices" :key="service.id" class="service-card">
        <div class="service-header">
          <h3>{{ service.name }}</h3>
          <span :class="['status-badge', service.status]">
            {{ service.status }}
          </span>
        </div>
        <div class="service-info">
          <p><i class="fas fa-tag"></i> {{ service.category }}</p>
          <p><i class="fas fa-clock"></i> {{ service.duration }} minutes</p>
          <p><i class="fas fa-dollar-sign"></i> ${{ service.price }}</p>
        </div>
        <div class="service-description">
          <p>{{ service.description }}</p>
        </div>
        <div class="service-actions">
          <button class="btn btn-sm btn-info" @click="viewService(service.id)">
            <i class="fas fa-eye"></i> View
          </button>
          <button class="btn btn-sm btn-primary" @click="editService(service)">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-sm btn-danger" @click="deleteService(service.id)">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Service Modal -->
    <Modal v-if="showAddModal || showEditModal" @close="closeModal">
      <template #header>
        <h3>{{ showEditModal ? 'Edit Service' : 'Add New Service' }}</h3>
      </template>
      <template #body>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Name <span class="required">*</span></label>
            <input type="text" v-model="serviceForm.name" required>
          </div>
          <div class="form-group">
            <label>Category <span class="required">*</span></label>
            <select v-model="serviceForm.category" required>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Price <span class="required">*</span></label>
            <input type="number" v-model="serviceForm.price" required min="0" step="0.01">
          </div>
          <div class="form-group">
            <label>Duration (minutes) <span class="required">*</span></label>
            <input type="number" v-model="serviceForm.duration" required min="1">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="serviceForm.description"></textarea>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="serviceForm.status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </form>
      </template>
      <template #footer>
        <button class="btn btn-secondary" @click="closeModal">Cancel</button>
        <button class="btn btn-primary" @click="handleSubmit" :disabled="loading">
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          {{ showEditModal ? 'Update Service' : 'Create Service' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Modal from '@/components/Modal.vue'

export default {
  name: 'ServicesList',
  components: {
    Modal
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    const services = ref([])
    const loading = ref(true)
    const error = ref(null)
    const searchQuery = ref('')
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const currentServiceId = ref(null)
    const filters = ref({
      category: '',
      sortBy: 'name'
    })

    const categories = ref([
      'Haircut',
      'Coloring',
      'Styling',
      'Treatment',
      'Makeup',
      'Nails'
    ])

    const serviceForm = ref({
      name: '',
      category: '',
      price: 0,
      duration: 30,
      description: '',
      status: 'active'
    })

    const filteredServices = computed(() => {
      let result = [...services.value]

      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(service => 
          service.name.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query)
        )
      }

      // Apply category filter
      if (filters.value.category) {
        result = result.filter(service => service.category === filters.value.category)
      }

      // Apply sorting
      result.sort((a, b) => {
        switch (filters.value.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'price':
            return b.price - a.price
          case 'duration':
            return b.duration - a.duration
          default:
            return 0
        }
      })

      return result
    })

    async function fetchServices() {
      try {
        loading.value = true
        services.value = await store.dispatch('fetchServices')
      } catch (err) {
        error.value = 'Failed to load services'
        console.error('Error fetching services:', err)
      } finally {
        loading.value = false
      }
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

    function viewService(id) {
      router.push(`/services/${id}`)
    }

    function editService(service) {
      currentServiceId.value = service.id
      serviceForm.value = { ...service }
      showEditModal.value = true
    }

    async function deleteService(id) {
      if (confirm('Are you sure you want to delete this service?')) {
        try {
          await store.dispatch('deleteService', id)
          await fetchServices()
        } catch (err) {
          console.error('Error deleting service:', err)
        }
      }
    }

    function closeModal() {
      showAddModal.value = false
      showEditModal.value = false
      currentServiceId.value = null
      serviceForm.value = {
        name: '',
        category: '',
        price: 0,
        duration: 30,
        description: '',
        status: 'active'
      }
    }

    async function handleSubmit() {
      try {
        loading.value = true
        if (showEditModal.value) {
          await store.dispatch('updateService', {
            id: currentServiceId.value,
            ...serviceForm.value
          })
        } else {
          await store.dispatch('createService', serviceForm.value)
        }
        closeModal()
        await fetchServices()
      } catch (err) {
        console.error('Error saving service:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchServices()
    })

    return {
      services,
      loading,
      error,
      searchQuery,
      showAddModal,
      showEditModal,
      filters,
      categories,
      serviceForm,
      filteredServices,
      handleSearch,
      handleFilter,
      handleSort,
      viewService,
      editService,
      deleteService,
      closeModal,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.services-list {
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

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.service-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.service-header h3 {
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

.service-info {
  margin-bottom: 1rem;
}

.service-info p {
  margin: 0.5rem 0;
  color: var(--text-secondary);
}

.service-info i {
  width: 1.25rem;
  margin-right: 0.5rem;
}

.service-description {
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.service-actions {
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

.required {
  color: var(--danger);
}
</style> 