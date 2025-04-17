<template>
  <div class="branch-form">
    <div class="page-header">
      <h1>{{ isEditMode ? 'Edit Branch' : 'Add New Branch' }}</h1>
      <button class="btn btn-secondary" @click="goBack">
        <i class="fas fa-arrow-left"></i> Back to Branches
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
        <label>Branch Name <span class="required">*</span></label>
        <input 
          type="text" 
          v-model="form.name" 
          required
          :class="{ 'error': errors.name }"
        >
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label>Address <span class="required">*</span></label>
        <input 
          type="text" 
          v-model="form.address" 
          required
          :class="{ 'error': errors.address }"
        >
        <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Phone <span class="required">*</span></label>
          <input 
            type="tel" 
            v-model="form.phone" 
            required
            :class="{ 'error': errors.phone }"
          >
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input 
            type="email" 
            v-model="form.email"
            :class="{ 'error': errors.email }"
          >
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>
      </div>

      <div class="form-group">
        <label>Manager <span class="required">*</span></label>
        <input 
          type="text" 
          v-model="form.manager_name" 
          required
          :class="{ 'error': errors.manager_name }"
        >
        <span v-if="errors.manager_name" class="error-message">{{ errors.manager_name }}</span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Opening Time <span class="required">*</span></label>
          <input 
            type="time" 
            v-model="form.opening_time" 
            required
            :class="{ 'error': errors.opening_time }"
          >
          <span v-if="errors.opening_time" class="error-message">{{ errors.opening_time }}</span>
        </div>

        <div class="form-group">
          <label>Closing Time <span class="required">*</span></label>
          <input 
            type="time" 
            v-model="form.closing_time" 
            required
            :class="{ 'error': errors.closing_time }"
          >
          <span v-if="errors.closing_time" class="error-message">{{ errors.closing_time }}</span>
        </div>
      </div>

      <div class="form-group">
        <label>Status</label>
        <select v-model="form.status">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea 
          v-model="form.description"
          :class="{ 'error': errors.description }"
        ></textarea>
        <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="goBack">Cancel</button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          {{ isEditMode ? 'Update Branch' : 'Create Branch' }}
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
  name: 'BranchForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const loading = ref(false)
    const error = ref(null)
    const errors = ref({})
    const successMessage = ref(null)

    const form = ref({
      name: '',
      address: '',
      phone: '',
      email: '',
      manager_name: '',
      opening_time: '09:00',
      closing_time: '18:00',
      status: 'active',
      description: ''
    })

    const isEditMode = computed(() => !!route.params.id)

    function validateForm() {
      errors.value = {}
      let isValid = true

      if (!form.value.name.trim()) {
        errors.value.name = 'Branch name is required'
        isValid = false
      } else if (form.value.name.length < 3) {
        errors.value.name = 'Branch name must be at least 3 characters long'
        isValid = false
      }

      if (!form.value.address.trim()) {
        errors.value.address = 'Address is required'
        isValid = false
      }

      if (!form.value.phone.trim()) {
        errors.value.phone = 'Phone is required'
        isValid = false
      } else if (!/^[+]?[\d\s-()]{7,15}$/.test(form.value.phone)) {
        errors.value.phone = 'Please enter a valid phone number'
        isValid = false
      }

      if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        errors.value.email = 'Please enter a valid email address'
        isValid = false
      }

      if (!form.value.manager_name.trim()) {
        errors.value.manager_name = 'Manager name is required'
        isValid = false
      }

      if (!form.value.opening_time) {
        errors.value.opening_time = 'Opening time is required'
        isValid = false
      }

      if (!form.value.closing_time) {
        errors.value.closing_time = 'Closing time is required'
        isValid = false
      }

      if (form.value.description.length > 500) {
        errors.value.description = 'Description must not exceed 500 characters'
        isValid = false
      }

      return isValid
    }

    async function fetchBranch() {
      if (!isEditMode.value) return

      try {
        loading.value = true
        const branch = await store.dispatch('fetchBranch', route.params.id)
        if (branch) {
          form.value = { ...branch }
        } else {
          error.value = 'Branch not found'
        }
      } catch (err) {
        error.value = 'Failed to load branch details'
        console.error('Error fetching branch:', err)
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
          await store.dispatch('updateBranch', {
            id: route.params.id,
            ...form.value
          })
          successMessage.value = 'Branch updated successfully'
        } else {
          await store.dispatch('createBranch', form.value)
          successMessage.value = 'Branch created successfully'
        }

        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push('/branches')
        }, 1500)
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to save branch'
        console.error('Error saving branch:', err)
      } finally {
        loading.value = false
      }
    }

    function goBack() {
      router.push('/branches')
    }

    onMounted(() => {
      fetchBranch()
    })

    return {
      loading,
      error,
      errors,
      successMessage,
      form,
      isEditMode,
      handleSubmit,
      goBack
    }
  }
}
</script>

<style scoped>
.branch-form {
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