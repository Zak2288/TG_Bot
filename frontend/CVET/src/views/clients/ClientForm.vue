<template>
  <div class="client-form">
    <div class="page-header">
      <h1>{{ isEdit ? 'Edit Client' : 'Add New Client' }}</h1>
      <button class="btn btn-secondary" @click="goBack">
        <i class="fas fa-arrow-left"></i> Back
      </button>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Name <span class="required">*</span></label>
          <input 
            type="text" 
            v-model="form.name" 
            required
            placeholder="Enter client's name"
          >
        </div>

        <div class="form-group">
          <label>Phone <span class="required">*</span></label>
          <input 
            type="tel" 
            v-model="form.phone" 
            required
            placeholder="Enter client's phone number"
          >
        </div>

        <div class="form-group">
          <label>Email</label>
          <input 
            type="email" 
            v-model="form.email"
            placeholder="Enter client's email"
          >
        </div>

        <div class="form-group">
          <label>Status</label>
          <select v-model="form.status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea 
            v-model="form.notes"
            placeholder="Enter any additional notes about the client"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="goBack">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            {{ isEdit ? 'Update Client' : 'Create Client' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'ClientForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const loading = ref(false)
    const isEdit = ref(false)
    const clientId = ref(null)

    const form = ref({
      name: '',
      phone: '',
      email: '',
      status: 'active',
      notes: ''
    })

    async function fetchClientDetails() {
      if (route.params.id) {
        try {
          loading.value = true
          const client = await store.dispatch('fetchClientById', route.params.id)
          form.value = { ...client }
          isEdit.value = true
          clientId.value = route.params.id
        } catch (err) {
          console.error('Error fetching client:', err)
          router.push('/clients')
        } finally {
          loading.value = false
        }
      }
    }

    async function handleSubmit() {
      try {
        loading.value = true
        if (isEdit.value) {
          await store.dispatch('updateClient', {
            id: clientId.value,
            ...form.value
          })
        } else {
          await store.dispatch('createClient', form.value)
        }
        router.push('/clients')
      } catch (err) {
        console.error('Error saving client:', err)
      } finally {
        loading.value = false
      }
    }

    function goBack() {
      router.push('/clients')
    }

    onMounted(() => {
      fetchClientDetails()
    })

    return {
      form,
      loading,
      isEdit,
      handleSubmit,
      goBack
    }
  }
}
</script>

<style scoped>
.client-form {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.form-container {
  max-width: 600px;
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
  font-weight: 500;
}

.required {
  color: var(--danger);
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

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style> 