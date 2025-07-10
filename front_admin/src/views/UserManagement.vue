<template>
  <div class="user-management">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Gestión de Usuarios</h1>
        <p class="page-description">
          Administra usuarios del sistema, roles y permisos
        </p>
      </div>
      
      <div class="header-actions">
        <button 
          @click="showCreateModal = true"
          class="btn-primary"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Crear Usuario
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <div class="filters-grid">
        <div class="filter-group">
          <label class="filter-label">Rol</label>
          <select 
            v-model="filters.role"
            @change="updateFilters({ role: filters.role })"
            class="filter-select"
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="operator">Operadores</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Estado</label>
          <select 
            v-model="filters.status"
            @change="updateFilters({ status: filters.status })"
            class="filter-select"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Buscar</label>
          <input 
            v-model="filters.search"
            @input="updateFilters({ search: filters.search })"
            type="text"
            placeholder="Buscar por nombre, usuario o email..."
            class="filter-input"
          />
        </div>

        <div class="filter-actions">
          <button 
            @click="resetFilters"
            class="btn-secondary"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon bg-blue-100 text-blue-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ filteredUsers.length }}</h3>
            <p class="stat-label">Total Usuarios</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-green-100 text-green-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ activeUsers.length }}</h3>
            <p class="stat-label">Usuarios Activos</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-purple-100 text-purple-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ admins.length }}</h3>
            <p class="stat-label">Administradores</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-orange-100 text-orange-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ operators.length }}</h3>
            <p class="stat-label">Operadores</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="table-section">
      <div class="table-container">
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>

        <div v-else-if="error" class="error-message">
          <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>{{ error }}</p>
          <button @click="loadUsers" class="btn-secondary">Reintentar</button>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="empty-state">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
          </svg>
          <h3>No se encontraron usuarios</h3>
          <p>No hay usuarios que coincidan con los filtros aplicados</p>
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha de Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="user in filteredUsers" 
              :key="user.id"
              class="table-row"
            >
              <td>
                <div class="user-info">
                  <div class="user-avatar">
                    <span>{{ user.name?.[0] || user.username[0] }}</span>
                  </div>
                  <div class="user-details">
                    <p class="user-name">{{ user.name || 'Sin nombre' }}</p>
                    <p class="user-username">@{{ user.username }}</p>
                  </div>
                </div>
              </td>
              <td>{{ user.email || 'No especificado' }}</td>
              <td>
                <span 
                  class="role-badge"
                  :class="user.role === 'admin' ? 'role-admin' : 'role-operator'"
                >
                  {{ user.role === 'admin' ? 'Administrador' : 'Operador' }}
                </span>
              </td>
              <td>
                <span 
                  class="status-badge"
                  :class="getStatusColor(user)"
                >
                  {{ getUserStatus(user) }}
                </span>
              </td>
              <td>{{ formatCreatedAt(user.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button 
                    @click="editUser(user)"
                    class="action-btn edit"
                    title="Editar usuario"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>

                  <button 
                    @click="resetUserPassword(user)"
                    class="action-btn reset"
                    title="Resetear contraseña"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </button>

                  <button 
                    @click="toggleUserStatus(user)"
                    class="action-btn toggle"
                    :title="user.isActive ? 'Desactivar usuario' : 'Activar usuario'"
                  >
                    <svg v-if="user.isActive" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </button>

                  <button 
                    @click="deleteUser(user)"
                    class="action-btn delete"
                    title="Eliminar usuario"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modales -->
    <UserFormModal 
      v-if="showCreateModal"
      :user="null"
      mode="create"
      @close="showCreateModal = false"
      @saved="handleUserSaved"
    />

    <UserFormModal 
      v-if="showEditModal"
      :user="selectedUser"
      mode="edit"
      @close="showEditModal = false"
      @saved="handleUserSaved"
    />

    <ConfirmationModal
      v-if="showDeleteModal"
      title="Eliminar Usuario"
      :message="`¿Estás seguro de que quieres eliminar al usuario '${userToDelete?.username}'? Esta acción no se puede deshacer.`"
      confirm-text="Eliminar"
      cancel-text="Cancelar"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />

    <ConfirmationModal
      v-if="showResetModal"
      title="Resetear Contraseña"
      :message="`¿Estás seguro de que quieres resetear la contraseña del usuario '${userToReset?.username}'?`"
      confirm-text="Resetear"
      cancel-text="Cancelar"
      @confirm="confirmReset"
      @cancel="showResetModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUsers } from '@/composables/useUsers'
import UserFormModal from '@/components/forms/UserFormModal.vue'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'

// Composables
const {
  users,
  loading,
  error,
  selectedUser,
  filters,
  filteredUsers,
  admins,
  operators,
  activeUsers,
  loadUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  toggleUserStatus,
  selectUser,
  clearSelection,
  updateFilters,
  resetFilters,
  getUserStatus,
  getStatusColor,
  formatCreatedAt,
  cleanup
} = useUsers()

// Estado local
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showResetModal = ref(false)
const userToDelete = ref(null)
const userToReset = ref(null)

// Acciones
const editUser = (user) => {
  selectUser(user)
  showEditModal.value = true
}

const deleteUser = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  try {
    await deleteUser(userToDelete.value.id)
    showDeleteModal.value = false
    userToDelete.value = null
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

const resetUserPassword = (user) => {
  userToReset.value = user
  showResetModal.value = true
}

const confirmReset = async () => {
  try {
    await resetPassword(userToReset.value.id)
    showResetModal.value = false
    userToReset.value = null
  } catch (error) {
    console.error('Error resetting password:', error)
  }
}

const toggleUserStatus = async (user) => {
  try {
    await toggleUserStatus(user.id)
  } catch (error) {
    console.error('Error toggling user status:', error)
  }
}

const handleUserSaved = () => {
  showCreateModal.value = false
  showEditModal.value = false
  clearSelection()
}

// Lifecycle
onMounted(() => {
  loadUsers()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.user-management {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.page-description {
  color: #6b7280;
  margin: 0;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.filters-section {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.filter-select,
.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.table-section {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.table-container {
  position: relative;
  min-height: 400px;
}

.loading-overlay,
.error-message,
.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #dc2626;
}

.empty-state {
  color: #6b7280;
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.empty-state p {
  margin: 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background-color: #f9fafb;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.table-row:hover {
  background-color: #f9fafb;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.user-username {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.role-badge,
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.role-admin {
  background-color: #fef3c7;
  color: #92400e;
}

.role-operator {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-badge {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.text-red-600 {
  background-color: #fee2e2;
  color: #dc2626;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.edit {
  background-color: #dbeafe;
  color: #1e40af;
}

.action-btn.edit:hover {
  background-color: #bfdbfe;
}

.action-btn.reset {
  background-color: #fef3c7;
  color: #92400e;
}

.action-btn.reset:hover {
  background-color: #fde68a;
}

.action-btn.toggle {
  background-color: #dcfce7;
  color: #166534;
}

.action-btn.toggle:hover {
  background-color: #bbf7d0;
}

.action-btn.delete {
  background-color: #fee2e2;
  color: #dc2626;
}

.action-btn.delete:hover {
  background-color: #fecaca;
}

/* Responsive */
@media (max-width: 768px) {
  .user-management {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .data-table {
    font-size: 0.875rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.75rem 0.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 1.75rem;
    height: 1.75rem;
  }
}
</style> 