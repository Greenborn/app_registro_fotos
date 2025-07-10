import { ref, computed } from 'vue'
import { useWebSocketStore } from '@/stores/websocket'
import { api } from '@/api'

export function useOperators() {
  const operators = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedOperator = ref(null)
  const filters = ref({
    status: 'all', // all, online, offline
    search: ''
  })

  const websocketStore = useWebSocketStore()

  // Computed properties
  const filteredOperators = computed(() => {
    let filtered = operators.value

    // Filtrar por estado
    if (filters.value.status !== 'all') {
      filtered = filtered.filter(op => {
        if (filters.value.status === 'online') {
          return op.isOnline
        } else if (filters.value.status === 'offline') {
          return !op.isOnline
        }
        return true
      })
    }

    // Filtrar por búsqueda
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      filtered = filtered.filter(op => 
        op.username.toLowerCase().includes(searchTerm) ||
        op.name?.toLowerCase().includes(searchTerm)
      )
    }

    return filtered
  })

  const onlineOperators = computed(() => 
    operators.value.filter(op => op.isOnline)
  )

  const offlineOperators = computed(() => 
    operators.value.filter(op => !op.isOnline)
  )

  // Cargar operadores
  const loadOperators = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.get('/users/operators')
      
      if (response.data.stat) {
        operators.value = response.data.data.map(operator => ({
          ...operator,
          isOnline: false,
          lastLocation: null,
          lastSeen: null
        }))
      } else {
        throw new Error(response.data.text || 'Error al cargar operadores')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error loading operators:', err)
    } finally {
      loading.value = false
    }
  }

  // Actualizar ubicación de operador
  const updateOperatorLocation = (operatorId, location) => {
    const operator = operators.value.find(op => op.id === operatorId)
    if (operator) {
      operator.lastLocation = location
      operator.lastSeen = new Date()
      operator.isOnline = true
    }
  }

  // Marcar operador como offline
  const markOperatorOffline = (operatorId) => {
    const operator = operators.value.find(op => op.id === operatorId)
    if (operator) {
      operator.isOnline = false
    }
  }

  // Seleccionar operador
  const selectOperator = (operator) => {
    selectedOperator.value = operator
  }

  // Limpiar selección
  const clearSelection = () => {
    selectedOperator.value = null
  }

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  // Resetear filtros
  const resetFilters = () => {
    filters.value = {
      status: 'all',
      search: ''
    }
  }

  // Obtener operador por ID
  const getOperatorById = (id) => {
    return operators.value.find(op => op.id === id)
  }

  // Obtener ubicación actual de operador
  const getOperatorLocation = (operatorId) => {
    const operator = getOperatorById(operatorId)
    return operator?.lastLocation || null
  }

  // Verificar si operador está online
  const isOperatorOnline = (operatorId) => {
    const operator = getOperatorById(operatorId)
    return operator?.isOnline || false
  }

  // Obtener tiempo desde última actividad
  const getLastSeen = (operatorId) => {
    const operator = getOperatorById(operatorId)
    if (!operator?.lastSeen) return null
    
    const now = new Date()
    const lastSeen = new Date(operator.lastSeen)
    const diffMs = now - lastSeen
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `${diffMins} min`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d`
  }

  // Suscribirse a actualizaciones de ubicación
  const subscribeToLocationUpdates = () => {
    websocketStore.socket.on('operator_location', (data) => {
      updateOperatorLocation(data.operatorId, {
        lat: data.lat,
        lng: data.lng,
        accuracy: data.accuracy,
        timestamp: data.timestamp
      })
    })

    websocketStore.socket.on('operator_offline', (data) => {
      markOperatorOffline(data.operatorId)
    })
  }

  // Desuscribirse de actualizaciones
  const unsubscribeFromLocationUpdates = () => {
    if (websocketStore.socket) {
      websocketStore.socket.off('operator_location')
      websocketStore.socket.off('operator_offline')
    }
  }

  // Inicializar
  const init = async () => {
    await loadOperators()
    subscribeToLocationUpdates()
  }

  // Limpiar
  const cleanup = () => {
    unsubscribeFromLocationUpdates()
    operators.value = []
    selectedOperator.value = null
    error.value = null
  }

  return {
    // State
    operators,
    loading,
    error,
    selectedOperator,
    filters,
    
    // Computed
    filteredOperators,
    onlineOperators,
    offlineOperators,
    
    // Methods
    loadOperators,
    updateOperatorLocation,
    markOperatorOffline,
    selectOperator,
    clearSelection,
    updateFilters,
    resetFilters,
    getOperatorById,
    getOperatorLocation,
    isOperatorOnline,
    getLastSeen,
    subscribeToLocationUpdates,
    unsubscribeFromLocationUpdates,
    init,
    cleanup
  }
} 