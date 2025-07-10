import { ref, computed } from 'vue'
import { api } from '@/api'

export function useUsers() {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedUser = ref(null)
  const filters = ref({
    role: 'all', // all, admin, operator
    status: 'all', // all, active, inactive
    search: ''
  })

  // Computed properties
  const filteredUsers = computed(() => {
    let filtered = users.value

    // Filtrar por rol
    if (filters.value.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.value.role)
    }

    // Filtrar por estado
    if (filters.value.status !== 'all') {
      filtered = filtered.filter(user => {
        if (filters.value.status === 'active') {
          return user.isActive
        } else if (filters.value.status === 'inactive') {
          return !user.isActive
        }
        return true
      })
    }

    // Filtrar por búsqueda
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.name?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm)
      )
    }

    return filtered
  })

  const admins = computed(() => 
    users.value.filter(user => user.role === 'admin')
  )

  const operators = computed(() => 
    users.value.filter(user => user.role === 'operator')
  )

  const activeUsers = computed(() => 
    users.value.filter(user => user.isActive)
  )

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.get('/users')
      
      if (response.data.stat) {
        users.value = response.data.data
      } else {
        throw new Error(response.data.text || 'Error al cargar usuarios')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error loading users:', err)
    } finally {
      loading.value = false
    }
  }

  // Crear usuario
  const createUser = async (userData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post('/users', userData)
      
      if (response.data.stat) {
        users.value.push(response.data.data)
        return response.data.data
      } else {
        throw new Error(response.data.text || 'Error al crear usuario')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error creating user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actualizar usuario
  const updateUser = async (userId, userData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.put(`/users/${userId}`, userData)
      
      if (response.data.stat) {
        const index = users.value.findIndex(u => u.id === userId)
        if (index !== -1) {
          users.value[index] = response.data.data
        }
        return response.data.data
      } else {
        throw new Error(response.data.text || 'Error al actualizar usuario')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error updating user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Eliminar usuario
  const deleteUser = async (userId) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.delete(`/users/${userId}`)
      
      if (response.data.stat) {
        users.value = users.value.filter(u => u.id !== userId)
        return true
      } else {
        throw new Error(response.data.text || 'Error al eliminar usuario')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error deleting user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener usuario por ID
  const getUserById = (userId) => {
    return users.value.find(u => u.id === userId)
  }

  // Seleccionar usuario
  const selectUser = (user) => {
    selectedUser.value = user
  }

  // Limpiar selección
  const clearSelection = () => {
    selectedUser.value = null
  }

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  // Resetear filtros
  const resetFilters = () => {
    filters.value = {
      role: 'all',
      status: 'all',
      search: ''
    }
  }

  // Resetear contraseña
  const resetPassword = async (userId) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post(`/users/${userId}/reset-password`)
      
      if (response.data.stat) {
        return response.data.data
      } else {
        throw new Error(response.data.text || 'Error al resetear contraseña')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error resetting password:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Activar/desactivar usuario
  const toggleUserStatus = async (userId) => {
    try {
      const user = getUserById(userId)
      if (!user) throw new Error('Usuario no encontrado')
      
      const newStatus = !user.isActive
      const response = await updateUser(userId, { isActive: newStatus })
      
      return response
    } catch (err) {
      error.value = err.message
      console.error('Error toggling user status:', err)
      throw err
    }
  }

  // Cambiar rol de usuario
  const changeUserRole = async (userId, newRole) => {
    try {
      const response = await updateUser(userId, { role: newRole })
      return response
    } catch (err) {
      error.value = err.message
      console.error('Error changing user role:', err)
      throw err
    }
  }

  // Obtener estadísticas de usuarios
  const getUserStats = async () => {
    try {
      const response = await api.get('/users/stats')
      
      if (response.data.stat) {
        return response.data.data
      } else {
        throw new Error(response.data.text || 'Error al obtener estadísticas')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error getting user stats:', err)
      return null
    }
  }

  // Validar datos de usuario
  const validateUserData = (userData) => {
    const errors = []

    if (!userData.username || userData.username.trim().length < 3) {
      errors.push('El nombre de usuario debe tener al menos 3 caracteres')
    }

    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('El email no es válido')
    }

    if (!userData.role || !['admin', 'operator'].includes(userData.role)) {
      errors.push('El rol debe ser admin u operator')
    }

    if (userData.password && userData.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres')
    }

    return errors
  }

  // Formatear fecha de creación
  const formatCreatedAt = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Obtener estado del usuario
  const getUserStatus = (user) => {
    if (!user.isActive) return 'Inactivo'
    return 'Activo'
  }

  // Obtener color del estado
  const getStatusColor = (user) => {
    if (!user.isActive) return 'text-red-600'
    return 'text-green-600'
  }

  // Limpiar
  const cleanup = () => {
    users.value = []
    selectedUser.value = null
    error.value = null
    resetFilters()
  }

  return {
    // State
    users,
    loading,
    error,
    selectedUser,
    filters,
    
    // Computed
    filteredUsers,
    admins,
    operators,
    activeUsers,
    
    // Methods
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    selectUser,
    clearSelection,
    updateFilters,
    resetFilters,
    resetPassword,
    toggleUserStatus,
    changeUserRole,
    getUserStats,
    validateUserData,
    formatCreatedAt,
    getUserStatus,
    getStatusColor,
    cleanup
  }
} 