<template>
  <div class="services-list">
    <div class="page-header">
      <h1>Услуги и прайс-лист</h1>
      <div class="header-actions">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск услуг..."
            @input="handleSearch"
          >
          <i class="fas fa-search"></i>
        </div>
        <button class="btn btn-primary" @click="showAddModal = true">
          <i class="fas fa-plus"></i> Добавить услугу
        </button>
      </div>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>Категория</label>
        <select v-model="filters.category" @change="handleFilter">
          <option value="">Все категории</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>Сортировка</label>
        <select v-model="filters.sortBy" @change="handleSort">
          <option value="name">По названию</option>
          <option value="price">По цене</option>
          <option value="duration">По длительности</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Загрузка услуг...
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i> {{ error }}
    </div>

    <div v-else class="services-grid">
      <div v-for="service in filteredServices" :key="service.id" class="service-card" :class="{'iris-service': isIrisService(service)}">
        <div class="service-header">
          <h3>
            {{ service.name }}
            <span v-if="isIrisService(service)" class="iris-badge" title="Услуга диагностики радужки">👁️</span>
          </h3>
          <span :class="['status-badge', service.isActive ? 'active' : 'inactive']">
            {{ service.isActive ? 'Активна' : 'Неактивна' }}
          </span>
        </div>
        <div class="service-info">
          <p><i class="fas fa-tag"></i> {{ service.category }}</p>
          <p><i class="fas fa-clock"></i> {{ service.duration }} минут</p>
          <p><i class="fas fa-ruble-sign"></i> {{ service.price }} ₽</p>
        </div>
        <div class="service-description" v-if="service.description">
          <p>{{ service.description }}</p>
        </div>
        <div class="service-actions">
          <button class="btn btn-sm btn-primary" @click="editService(service)">
            <i class="fas fa-edit"></i> Изменить
          </button>
          <button class="btn btn-sm btn-danger" @click="deleteService(service.id)">
            <i class="fas fa-trash"></i> Удалить
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования услуги -->
    <Modal v-if="showAddModal || showEditModal" @close="closeModal">
      <template #header>
        <h3>{{ showEditModal ? 'Редактирование услуги' : 'Добавление новой услуги' }}</h3>
      </template>
      <template #body>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Название <span class="required">*</span></label>
            <input type="text" v-model="serviceForm.name" required>
          </div>
          <div class="form-group">
            <label>Категория <span class="required">*</span></label>
            <select v-model="serviceForm.category" required>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Цена (₽) <span class="required">*</span></label>
            <input type="number" v-model="serviceForm.price" required min="0" step="1">
          </div>
          <div class="form-group">
            <label>Длительность (минут) <span class="required">*</span></label>
            <input type="number" v-model="serviceForm.duration" required min="1">
          </div>
          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="serviceForm.description"></textarea>
          </div>
          <div class="form-group">
            <label>Статус</label>
            <select v-model="serviceForm.isActive">
              <option :value="true">Активна</option>
              <option :value="false">Неактивна</option>
            </select>
          </div>
        </form>
      </template>
      <template #footer>
        <button class="btn btn-secondary" @click="closeModal">Отмена</button>
        <button class="btn btn-primary" @click="handleSubmit" :disabled="loading">
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          {{ showEditModal ? 'Сохранить изменения' : 'Создать услугу' }}
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

    // Предустановленные категории услуг
    const categories = ref([
      'Диагностика радужки',
      'Маникюр',
      'Педикюр',
      'Прическа',
      'Макияж',
      'Массаж',
      'Другое'
    ])

    const serviceForm = ref({
      name: '',
      category: '',
      price: 0,
      duration: 30,
      description: '',
      isActive: true
    })

    const filteredServices = computed(() => {
      let result = [...services.value]

      // Применяем поиск
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(service => 
          service.name.toLowerCase().includes(query) ||
          (service.description && service.description.toLowerCase().includes(query))
        )
      }

      // Применяем фильтр по категории
      if (filters.value.category) {
        result = result.filter(service => service.category === filters.value.category)
      }

      // Применяем сортировку
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

    // Проверка, является ли услуга диагностикой радужки
    function isIrisService(service) {
      return service.category === 'Диагностика радужки' || 
             service.name.toLowerCase().includes('радужк');
    }

    async function fetchServices() {
      try {
        loading.value = true
        services.value = await store.dispatch('fetchServices')
      } catch (err) {
        error.value = 'Не удалось загрузить услуги'
        console.error('Ошибка при загрузке услуг:', err)
      } finally {
        loading.value = false
      }
    }

    function handleSearch() {
      // Поиск обрабатывается через computed свойство
    }

    function handleFilter() {
      // Фильтрация обрабатывается через computed свойство
    }

    function handleSort() {
      // Сортировка обрабатывается через computed свойство
    }

    function editService(service) {
      currentServiceId.value = service.id
      serviceForm.value = { ...service }
      showEditModal.value = true
    }

    async function deleteService(id) {
      if (confirm('Вы уверены, что хотите удалить эту услугу?')) {
        try {
          await store.dispatch('deleteService', id)
          await fetchServices()
        } catch (err) {
          console.error('Ошибка при удалении услуги:', err)
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
        isActive: true
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
        console.error('Ошибка при сохранении услуги:', err)
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
      isIrisService,
      handleSearch,
      handleFilter,
      handleSort,
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
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  width: 300px;
}

.search-box i {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
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
  color: #6c757d;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.service-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.iris-service {
  border-left: 5px solid #00708f;
  background-color: #f0f8ff;
}

.iris-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  color: #00708f;
  font-size: 16px;
}

.service-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.service-header h3 {
  margin: 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background-color: #ffebee;
  color: #c62828;
}

.service-info {
  padding: 1rem 1.5rem;
}

.service-info p {
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
}

.service-info i {
  width: 20px;
  margin-right: 0.5rem;
  color: #6c757d;
}

.service-description {
  padding: 0 1.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.service-actions {
  padding: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.error-state {
  color: #c62828;
}

.required {
  color: #c62828;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}
</style> 