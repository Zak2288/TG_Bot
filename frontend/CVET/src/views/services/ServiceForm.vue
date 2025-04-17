<template>
  <div class="service-form">
    <div class="page-header">
      <h1>{{ isEditMode ? 'Edit Service' : 'Add New Service' }}</h1>
      <button class="btn btn-secondary" @click="goBack">
        <i class="fas fa-arrow-left"></i> Back to Services
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Loading...
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i> {{ error }}
    </div>

    <div v-else-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <form v-else @submit.prevent="handleSubmit" class="form-container">
      <div class="form-group">
        <label>Name <span class="required">*</span></label>
        <input 
          type="text" 
          v-model="form.name" 
          required
          :class="{ 'error': errors.name }"
        >
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label>Category <span class="required">*</span></label>
        <select 
          v-model="form.category" 
          required
          :class="{ 'error': errors.category }"
        >
          <option value="">Select a category</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <span v-if="errors.category" class="error-message">{{ errors.category }}</span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Price <span class="required">*</span></label>
          <input 
            type="number" 
            v-model="form.price" 
            required 
            min="0" 
            step="0.01"
            :class="{ 'error': errors.price }"
          >
          <span v-if="errors.price" class="error-message">{{ errors.price }}</span>
        </div>

        <div class="form-group">
          <label>Duration (minutes) <span class="required">*</span></label>
          <input 
            type="number" 
            v-model="form.duration" 
            required 
            min="1"
            :class="{ 'error': errors.duration }"
          >
          <span v-if="errors.duration" class="error-message">{{ errors.duration }}</span>
        </div>
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea 
          v-model="form.description"
          :class="{ 'error': errors.description }"
        ></textarea>
        <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
      </div>

      <div class="form-group">
        <label>Status</label>
        <select v-model="form.status">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="goBack">Cancel</button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          {{ isEditMode ? 'Update Service' : 'Create Service' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'ServiceForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const loading = ref(false)
    const error = ref(null)
    const errors = ref({})
    const successMessage = ref(null)

    const categories = ref([
      'Haircut',
      'Coloring',
      'Styling',
      'Treatment',
      'Makeup',
      'Nails'
    ])

    const form = ref({
      name: '',
      category: '',
      price: 0,
      duration: 30,
      description: '',
      status: 'active'
    })

    const isEditMode = computed(() => !!route.params.id)

    function validateForm() {
      errors.value = {}
      let isValid = true

      if (!form.value.name.trim()) {
        errors.value.name = 'Name is required'
        isValid = false
      } else if (form.value.name.length < 3) {
        errors.value.name = 'Name must be at least 3 characters long'
        isValid = false
      }

      if (!form.value.category) {
        errors.value.category = 'Category is required'
        isValid = false
      }

      if (form.value.price <= 0) {
        errors.value.price = 'Price must be greater than 0'
        isValid = false
      }

      if (form.value.duration <= 0) {
        errors.value.duration = 'Duration must be greater than 0'
        isValid = false
      }

      if (form.value.description.length > 500) {
        errors.value.description = 'Description must not exceed 500 characters'
        isValid = false
      }

      return isValid
    }

    async function fetchService() {
      if (!isEditMode.value) return

      try {
        loading.value = true
        const service = await store.dispatch('fetchService', route.params.id)
        if (service) {
          form.value = { ...service }
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

    async function handleSubmit() {
      if (!validateForm()) return

      try {
        loading.value = true
        error.value = null
        successMessage.value = null

        if (isEditMode.value) {
          await store.dispatch('updateService', {
            id: route.params.id,
            ...form.value
          })
          successMessage.value = 'Service updated successfully'
        } else {
          await store.dispatch('createService', form.value)
          successMessage.value = 'Service created successfully'
        }

        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push('/services')
        }, 1500)
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to save service'
        console.error('Error saving service:', err)
      } finally {
        loading.value = false
      }
    }

    function goBack() {
      router.push('/services')
    }

    onMounted(() => {
      fetchService()
    })

    return {
      loading,
      error,
      errors,
      successMessage,
      form,
      categories,
      isEditMode,
      handleSubmit,
      goBack
    }
  }
}
</script>

<style scoped>
.service-form {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.required {
  color: var(--danger);
}

.error {
  border-color: var(--danger) !important;
}

.error-message {
  color: var(--danger);
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
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

.success-message {
  color: var(--success);
  background-color: var(--success-light);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
}

.form-group input.error:focus,
.form-group select.error:focus,
.form-group textarea.error:focus {
  border-color: var(--danger);
  box-shadow: 0 0 0 2px rgba(var(--danger-rgb), 0.1);
}
</style> 