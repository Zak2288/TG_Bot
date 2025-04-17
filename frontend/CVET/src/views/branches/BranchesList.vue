<template>
  <div class="branches-list">
    <div class="page-header">
      <h1>Branches</h1>
      <button class="btn btn-primary" @click="navigateToAddBranch">
        <i class="fas fa-plus"></i> Add Branch
      </button>
    </div>

    <div class="search-filters">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search branches..."
          @input="filterBranches"
        >
      </div>
      <div class="filters">
        <select v-model="statusFilter" @change="filterBranches">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Loading branches...
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i> {{ error }}
    </div>

    <div v-else-if="filteredBranches.length === 0" class="empty-state">
      <i class="fas fa-store-alt-slash"></i>
      <h3>No branches found</h3>
      <p v-if="searchQuery || statusFilter !== 'all'">Try adjusting your search or filters</p>
      <p v-else>Start by adding your first branch</p>
      <button class="btn btn-primary" @click="navigateToAddBranch">
        <i class="fas fa-plus"></i> Add Branch
      </button>
    </div>

    <div v-else class="branches-grid">
      <div 
        v-for="branch in filteredBranches" 
        :key="branch.id" 
        class="branch-card"
        :class="{ 'inactive': branch.status === 'inactive' }"
      >
        <div class="branch-header">
          <h3>{{ branch.name }}</h3>
          <span :class="['status-badge', branch.status]">{{ branch.status }}</span>
        </div>
        <div class="branch-info">
          <div class="info-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ branch.address }}</span>
          </div>
          <div class="info-item">
            <i class="fas fa-phone"></i>
            <span>{{ branch.phone }}</span>
          </div>
          <div class="info-item">
            <i class="fas fa-user-tie"></i>
            <span>{{ branch.manager_name }}</span>
          </div>
        </div>
        <div class="branch-footer">
          <button class="btn btn-sm" @click="viewBranchDetails(branch.id)">View</button>
          <button class="btn btn-sm btn-edit" @click="editBranch(branch.id)">Edit</button>
          <button class="btn btn-sm btn-danger" @click="confirmDelete(branch)">Delete</button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
      <template #header>
        <h3>Confirm Delete</h3>
      </template>
      <template #body>
        <p>Are you sure you want to delete this branch?</p>
        <p>Branch: <strong>{{ branchToDelete?.name }}</strong></p>
        <p class="text-danger">This action cannot be undone!</p>
      </template>
      <template #footer>
        <button class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
        <button class="btn btn-danger" @click="deleteBranch">Delete</button>
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
  name: 'BranchesList',
  components: {
    Modal
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    const branches = ref([])
    const filteredBranches = ref([])
    const loading = ref(true)
    const error = ref(null)
    const searchQuery = ref('')
    const statusFilter = ref('all')
    const showDeleteModal = ref(false)
    const branchToDelete = ref(null)

    async function fetchBranches() {
      try {
        loading.value = true
        const response = await store.dispatch('fetchBranches')
        branches.value = response || []
        filterBranches()
      } catch (err) {
        error.value = 'Failed to load branches'
        console.error('Error fetching branches:', err)
      } finally {
        loading.value = false
      }
    }

    function filterBranches() {
      let result = [...branches.value]
      
      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(branch => 
          branch.name.toLowerCase().includes(query) || 
          branch.address.toLowerCase().includes(query) ||
          branch.manager_name.toLowerCase().includes(query)
        )
      }
      
      // Apply status filter
      if (statusFilter.value !== 'all') {
        result = result.filter(branch => branch.status === statusFilter.value)
      }
      
      filteredBranches.value = result
    }

    function navigateToAddBranch() {
      router.push('/branches/create')
    }

    function viewBranchDetails(id) {
      router.push(`/branches/${id}`)
    }

    function editBranch(id) {
      router.push(`/branches/${id}/edit`)
    }

    function confirmDelete(branch) {
      branchToDelete.value = branch
      showDeleteModal.value = true
    }

    async function deleteBranch() {
      if (!branchToDelete.value) return
      
      try {
        loading.value = true
        await store.dispatch('deleteBranch', branchToDelete.value.id)
        await fetchBranches()
        showDeleteModal.value = false
      } catch (err) {
        error.value = 'Failed to delete branch'
        console.error('Error deleting branch:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchBranches()
    })

    return {
      branches,
      filteredBranches,
      loading,
      error,
      searchQuery,
      statusFilter,
      showDeleteModal,
      branchToDelete,
      navigateToAddBranch,
      viewBranchDetails,
      editBranch,
      filterBranches,
      confirmDelete,
      deleteBranch
    }
  }
}
</script>

<style scoped>
.branches-list {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.search-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
}

.filters select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
}

.branches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.branch-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.branch-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.branch-card.inactive {
  opacity: 0.7;
}

.branch-header {
  padding: 1.25rem;
  background-color: var(--primary-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.branch-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--primary);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
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

.branch-info {
  padding: 1.25rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item i {
  color: var(--text-secondary);
  margin-right: 0.75rem;
  margin-top: 0.25rem;
}

.branch-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.875rem;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-state i {
  font-size: 3rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.error-state {
  color: var(--danger);
}

.text-danger {
  color: var(--danger);
}
</style> 