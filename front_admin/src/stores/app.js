import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toast } from 'vue-toastification'

export const useAppStore = defineStore('app', () => {
  // Estado global de la aplicación
  const loading = ref(false)
  const sidebarCollapsed = ref(false)
  const theme = ref('light')
  const language = ref('es')
  const notifications = ref([])
  const pageHidden = ref(false)
  const hasUnsavedChanges = ref(false)
  const searchQuery = ref('')
  const filters = ref({})
  const sortBy = ref('')
  const sortOrder = ref('asc')
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0
  })

  // Estado de modales
  const showConfirmation = ref(false)
  const confirmationTitle = ref('')
  const confirmationMessage = ref('')
  const confirmationConfirmText = ref('Confirmar')
  const confirmationCancelText = ref('Cancelar')
  const confirmationType = ref('warning')
  const confirmationCallback = ref(null)

  const showError = ref(false)
  const errorTitle = ref('')
  const errorMessage = ref('')
  const errorDetails = ref('')

  const showInfo = ref(false)
  const infoTitle = ref('')
  const infoMessage = ref('')
  const infoType = ref('info')

  // Estado de WebSocket
  const wsConnected = ref(false)
  const wsReconnecting = ref(false)
  const wsMessages = ref([])

  // Estado de notificaciones en tiempo real
  const realTimeNotifications = ref([])
  const unreadCount = ref(0)

  // Getters
  const isDarkMode = computed(() => theme.value === 'dark')
  const isMobile = computed(() => window.innerWidth < 768)
  const isTablet = computed(() => window.innerWidth >= 768 && window.innerWidth < 1024)
  const isDesktop = computed(() => window.innerWidth >= 1024)

  const currentFilters = computed(() => {
    return Object.keys(filters.value).filter(key => filters.value[key] !== null && filters.value[key] !== '')
  })

  const hasActiveFilters = computed(() => currentFilters.value.length > 0)

  const currentSort = computed(() => ({
    field: sortBy.value,
    order: sortOrder.value
  }))

  const paginationInfo = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.limit + 1
    const end = Math.min(pagination.value.page * pagination.value.limit, pagination.value.total)
    return {
      start,
      end,
      total: pagination.value.total,
      page: pagination.value.page,
      limit: pagination.value.limit,
      totalPages: Math.ceil(pagination.value.total / pagination.value.limit)
    }
  })

  // Acciones
  const initialize = async () => {
    try {
      loading.value = true
      
      // Cargar configuración desde localStorage
      loadConfiguration()
      
      // Aplicar tema
      applyTheme()
      
      // Configurar listeners de ventana
      setupWindowListeners()
      
      // Cargar preferencias del usuario
      await loadUserPreferences()
      
    } catch (error) {
      console.error('Error al inicializar la aplicación:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const setLoading = (value) => {
    loading.value = value
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    saveConfiguration()
  }

  const setSidebarCollapsed = (value) => {
    sidebarCollapsed.value = value
    saveConfiguration()
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    applyTheme()
    saveConfiguration()
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
    applyTheme()
    saveConfiguration()
  }

  const setLanguage = (newLanguage) => {
    language.value = newLanguage
    saveConfiguration()
    // Aquí se podría implementar el cambio de idioma
  }

  const addNotification = (notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      ...notification,
      timestamp: new Date(),
      read: false
    }
    
    notifications.value.unshift(newNotification)
    
    // Limitar el número de notificaciones
    if (notifications.value.length > 100) {
      notifications.value = notifications.value.slice(0, 100)
    }
    
    // Incrementar contador de no leídas
    if (!notification.read) {
      unreadCount.value++
    }
  }

  const markNotificationAsRead = (id) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  const markAllNotificationsAsRead = () => {
    notifications.value.forEach(notification => {
      notification.read = true
    })
    unreadCount.value = 0
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      const notification = notifications.value[index]
      if (!notification.read) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      notifications.value.splice(index, 1)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
    unreadCount.value = 0
  }

  const setPageHidden = (hidden) => {
    pageHidden.value = hidden
  }

  const setUnsavedChanges = (hasChanges) => {
    hasUnsavedChanges.value = hasChanges
  }

  const setSearchQuery = (query) => {
    searchQuery.value = query
  }

  const setFilters = (newFilters) => {
    filters.value = { ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const setSort = (field, order = 'asc') => {
    sortBy.value = field
    sortOrder.value = order
  }

  const setPagination = (newPagination) => {
    pagination.value = { ...pagination.value, ...newPagination }
  }

  const resetPagination = () => {
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0
    }
  }

  // Modales
  const showConfirmationModal = (title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'warning', callback = null) => {
    confirmationTitle.value = title
    confirmationMessage.value = message
    confirmationConfirmText.value = confirmText
    confirmationCancelText.value = cancelText
    confirmationType.value = type
    confirmationCallback.value = callback
    showConfirmation.value = true
  }

  const confirmAction = () => {
    if (confirmationCallback.value) {
      confirmationCallback.value()
    }
    showConfirmation.value = false
    confirmationCallback.value = null
  }

  const cancelAction = () => {
    showConfirmation.value = false
    confirmationCallback.value = null
  }

  const showErrorModal = (title, message, details = '') => {
    errorTitle.value = title
    errorMessage.value = message
    errorDetails.value = details
    showError.value = true
  }

  const closeError = () => {
    showError.value = false
    errorTitle.value = ''
    errorMessage.value = ''
    errorDetails.value = ''
  }

  const showInfoModal = (title, message, type = 'info') => {
    infoTitle.value = title
    infoMessage.value = message
    infoType.value = type
    showInfo.value = true
  }

  const closeInfo = () => {
    showInfo.value = false
    infoTitle.value = ''
    infoMessage.value = ''
    infoType.value = 'info'
  }

  const closeAllModals = () => {
    showConfirmation.value = false
    showError.value = false
    showInfo.value = false
    confirmationCallback.value = null
  }

  // WebSocket
  const setWsConnected = (connected) => {
    wsConnected.value = connected
  }

  const setWsReconnecting = (reconnecting) => {
    wsReconnecting.value = reconnecting
  }

  const addWsMessage = (message) => {
    wsMessages.value.unshift({
      id: Date.now() + Math.random(),
      ...message,
      timestamp: new Date()
    })
    
    // Limitar mensajes
    if (wsMessages.value.length > 50) {
      wsMessages.value = wsMessages.value.slice(0, 50)
    }
  }

  const clearWsMessages = () => {
    wsMessages.value = []
  }

  // Notificaciones en tiempo real
  const addRealTimeNotification = (notification) => {
    realTimeNotifications.value.unshift({
      id: Date.now() + Math.random(),
      ...notification,
      timestamp: new Date(),
      read: false
    })
    
    // Limitar notificaciones
    if (realTimeNotifications.value.length > 20) {
      realTimeNotifications.value = realTimeNotifications.value.slice(0, 20)
    }
    
    unreadCount.value++
    
    // Mostrar toast
    toast.info(notification.message, {
      timeout: 5000,
      position: 'top-right'
    })
  }

  const markRealTimeNotificationAsRead = (id) => {
    const notification = realTimeNotifications.value.find(n => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  const clearRealTimeNotifications = () => {
    realTimeNotifications.value = []
    unreadCount.value = 0
  }

  // Acciones de teclado
  const triggerSave = () => {
    // Esta función será sobrescrita por los componentes que la necesiten
    console.log('Trigger save')
  }

  const triggerNew = () => {
    // Esta función será sobrescrita por los componentes que la necesiten
    console.log('Trigger new')
  }

  const triggerSearch = () => {
    // Esta función será sobrescrita por los componentes que la necesiten
    console.log('Trigger search')
  }

  // Utilidades
  const saveState = () => {
    saveConfiguration()
  }

  const loadConfiguration = () => {
    try {
      const config = localStorage.getItem('app_config')
      if (config) {
        const parsedConfig = JSON.parse(config)
        sidebarCollapsed.value = parsedConfig.sidebarCollapsed ?? false
        theme.value = parsedConfig.theme ?? 'light'
        language.value = parsedConfig.language ?? 'es'
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error)
    }
  }

  const saveConfiguration = () => {
    try {
      const config = {
        sidebarCollapsed: sidebarCollapsed.value,
        theme: theme.value,
        language: language.value
      }
      localStorage.setItem('app_config', JSON.stringify(config))
    } catch (error) {
      console.error('Error al guardar configuración:', error)
    }
  }

  const applyTheme = () => {
    const root = document.documentElement
    if (theme.value === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  const setupWindowListeners = () => {
    // Listener para cambios de tamaño de ventana
    const handleResize = () => {
      // Auto-colapsar sidebar en móvil
      if (isMobile.value && !sidebarCollapsed.value) {
        sidebarCollapsed.value = true
      }
    }

    window.addEventListener('resize', handleResize)
    
    // Ejecutar una vez al inicio
    handleResize()
  }

  const loadUserPreferences = async () => {
    // Aquí se cargarían las preferencias del usuario desde el backend
    // Por ahora es una función placeholder
  }

  return {
    // Estado
    loading,
    sidebarCollapsed,
    theme,
    language,
    notifications,
    pageHidden,
    hasUnsavedChanges,
    searchQuery,
    filters,
    sortBy,
    sortOrder,
    pagination,
    showConfirmation,
    confirmationTitle,
    confirmationMessage,
    confirmationConfirmText,
    confirmationCancelText,
    confirmationType,
    showError,
    errorTitle,
    errorMessage,
    errorDetails,
    showInfo,
    infoTitle,
    infoMessage,
    infoType,
    wsConnected,
    wsReconnecting,
    wsMessages,
    realTimeNotifications,
    unreadCount,

    // Getters
    isDarkMode,
    isMobile,
    isTablet,
    isDesktop,
    currentFilters,
    hasActiveFilters,
    currentSort,
    paginationInfo,

    // Acciones
    initialize,
    setLoading,
    toggleSidebar,
    setSidebarCollapsed,
    toggleTheme,
    setTheme,
    setLanguage,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearNotifications,
    setPageHidden,
    setUnsavedChanges,
    setSearchQuery,
    setFilters,
    clearFilters,
    setSort,
    setPagination,
    resetPagination,
    showConfirmationModal,
    confirmAction,
    cancelAction,
    showErrorModal,
    closeError,
    showInfoModal,
    closeInfo,
    closeAllModals,
    setWsConnected,
    setWsReconnecting,
    addWsMessage,
    clearWsMessages,
    addRealTimeNotification,
    markRealTimeNotificationAsRead,
    clearRealTimeNotifications,
    triggerSave,
    triggerNew,
    triggerSearch,
    saveState
  }
}) 