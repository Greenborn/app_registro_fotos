import { ref } from 'vue'

// Estado global de notificaciones
const notifications = ref([])
let notificationId = 0

export function useNotifications() {
  // Tipos de notificación
  const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  }

  // Agregar notificación
  const addNotification = (message, type = NOTIFICATION_TYPES.INFO, options = {}) => {
    const id = ++notificationId
    const notification = {
      id,
      message,
      type,
      timestamp: new Date(),
      duration: options.duration || 5000,
      persistent: options.persistent || false,
      ...options
    }

    notifications.value.push(notification)

    // Auto-remover si no es persistente
    if (!notification.persistent && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration)
    }

    return id
  }

  // Remover notificación
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  // Limpiar todas las notificaciones
  const clearNotifications = () => {
    notifications.value = []
  }

  // Funciones de conveniencia
  const success = (message, options = {}) => {
    return addNotification(message, NOTIFICATION_TYPES.SUCCESS, {
      duration: 3000,
      ...options
    })
  }

  const error = (message, options = {}) => {
    return addNotification(message, NOTIFICATION_TYPES.ERROR, {
      duration: 7000,
      persistent: true,
      ...options
    })
  }

  const warning = (message, options = {}) => {
    return addNotification(message, NOTIFICATION_TYPES.WARNING, {
      duration: 5000,
      ...options
    })
  }

  const info = (message, options = {}) => {
    return addNotification(message, NOTIFICATION_TYPES.INFO, {
      duration: 4000,
      ...options
    })
  }

  // Función para mostrar errores de API
  const showApiError = (error, defaultMessage = 'Error en la operación') => {
    let message = defaultMessage
    
    if (error?.response?.data?.text) {
      message = error.response.data.text
    } else if (error?.message) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }

    error(message)
  }

  // Función para mostrar errores de validación
  const showValidationError = (errors) => {
    if (Array.isArray(errors)) {
      errors.forEach(error => error(error))
    } else if (typeof errors === 'string') {
      error(errors)
    } else {
      error('Error de validación')
    }
  }

  // Función para mostrar mensajes de éxito de operaciones CRUD
  const showCrudSuccess = (operation, entity = 'elemento') => {
    const messages = {
      create: `${entity} creado exitosamente`,
      update: `${entity} actualizado exitosamente`,
      delete: `${entity} eliminado exitosamente`,
      save: `${entity} guardado exitosamente`
    }
    
    success(messages[operation] || messages.save)
  }

  return {
    notifications,
    NOTIFICATION_TYPES,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    warning,
    info,
    showApiError,
    showValidationError,
    showCrudSuccess
  }
} 