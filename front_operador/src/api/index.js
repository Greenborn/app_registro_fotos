import axios from 'axios'
import { toast } from 'vue-toastification'
// import { useAuthStore } from '../stores/auth'
// import { useAppStore } from '../stores/app'

// Configuración base de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000, // 30 segundos para móviles
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor de solicitudes
api.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación
    // const authStore = useAuthStore()
    // if (authStore.accessToken) {
    //   config.headers.Authorization = `Bearer ${authStore.accessToken}`
    // }

    // Agregar headers específicos para móviles
    config.headers['X-Device-Type'] = 'mobile'
    config.headers['X-App-Version'] = '1.0.0'
    config.headers['X-Platform'] = 'web'

    // Agregar información de geolocalización si está disponible
    const lastLocation = localStorage.getItem('lastKnownLocation')
    if (lastLocation) {
      try {
        const location = JSON.parse(lastLocation)
        config.headers['X-Location'] = `${location.lat},${location.lng}`
        config.headers['X-Location-Accuracy'] = location.accuracy
      } catch (error) {
        console.warn('Error al parsear ubicación:', error)
      }
    }

    // Log de solicitudes en desarrollo
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        headers: config.headers
      })
    }

    return config
  },
  (error) => {
    console.error('Error en interceptor de solicitud:', error)
    return Promise.reject(error)
  }
)

// Interceptor de respuestas
api.interceptors.response.use(
  (response) => {
    // Log de respuestas en desarrollo
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      })
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config
    // const authStore = useAuthStore()
    // const appStore = useAppStore()

    // Log de errores
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    })

    // Manejar errores de autenticación
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Intentar renovar el token
        // await authStore.refreshAuthToken()
        
        // Reintentar la solicitud original
        return api(originalRequest)
      } catch (refreshError) {
        // Si no se puede renovar, cerrar sesión
        console.error('Error al renovar token:', refreshError)
        // authStore.clearAuth()
        
        // Redirigir al login
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Manejar errores de red
    if (!error.response) {
      // appStore.setOnlineStatus(false)
      toast.error('Error de conexión. Verifique su conexión a internet.')
      return Promise.reject(error)
    }

    // Manejar errores específicos
    const status = error.response.status
    const message = error.response.data?.message || 'Error desconocido'

    switch (status) {
      case 400:
        toast.error(`Error de validación: ${message}`)
        break
      case 403:
        toast.error('No tiene permisos para realizar esta acción')
        break
      case 404:
        toast.error('Recurso no encontrado')
        break
      case 422:
        toast.error(`Error de validación: ${message}`)
        break
      case 429:
        toast.error('Demasiadas solicitudes. Intente más tarde.')
        break
      case 500:
        toast.error('Error interno del servidor')
        break
      case 502:
      case 503:
      case 504:
        toast.error('Servicio temporalmente no disponible')
        break
      default:
        toast.error(message)
    }

    return Promise.reject(error)
  }
)

// Configuración específica para subida de archivos
const uploadConfig = {
  timeout: 120000, // 2 minutos para subidas
  headers: {
    'Content-Type': 'multipart/form-data'
  },
  onUploadProgress: (progressEvent) => {
    const percentCompleted = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    )
    
    // Emitir evento de progreso
    const event = new CustomEvent('upload-progress', {
      detail: { percent: percentCompleted }
    })
    window.dispatchEvent(event)
  }
}

// Métodos de API para fotos
export const photosApiTemp = {
  // Obtener fotos del usuario
  getPhotos: (params = {}) => {
    return api.get('/photos', { params })
  },

  // Obtener una foto específica
  getPhoto: (id) => {
    return api.get(`/photos/${id}`)
  },

  // Subir una nueva foto
  uploadPhoto: (photoData) => {
    const formData = new FormData()
    
    // Agregar archivo
    formData.append('photo', photoData.file)
    
    // Agregar metadatos
    formData.append('title', photoData.title || '')
    formData.append('description', photoData.description || '')
    formData.append('tags', JSON.stringify(photoData.tags || []))
    
    // Agregar ubicación
    if (photoData.location) {
      formData.append('latitude', photoData.location.lat)
      formData.append('longitude', photoData.location.lng)
      formData.append('accuracy', photoData.location.accuracy || 0)
    }
    
    // Agregar configuración de cámara
    if (photoData.cameraSettings) {
      formData.append('cameraSettings', JSON.stringify(photoData.cameraSettings))
    }

    return api.post('/photos/upload', formData, uploadConfig)
  },

  // Actualizar una foto
  updatePhoto: (id, photoData) => {
    return api.put(`/photos/${id}`, photoData)
  },

  // Eliminar una foto
  deletePhoto: (id) => {
    return api.delete(`/photos/${id}`)
  },

  // Obtener estadísticas de fotos
  getStats: () => {
    return api.get('/photos/stats')
  },

  // Sincronizar fotos offline
  syncOfflinePhotos: (photos) => {
    return api.post('/photos/sync', { photos })
  }
}

// Métodos de API para ubicaciones
export const locationsAPI = {
  // Obtener ubicaciones del usuario
  getLocations: (params = {}) => {
    return api.get('/locations', { params })
  },

  // Obtener una ubicación específica
  getLocation: (id) => {
    return api.get(`/locations/${id}`)
  },

  // Crear una nueva ubicación
  createLocation: (locationData) => {
    return api.post('/locations', locationData)
  },

  // Actualizar una ubicación
  updateLocation: (id, locationData) => {
    return api.put(`/locations/${id}`, locationData)
  },

  // Eliminar una ubicación
  deleteLocation: (id) => {
    return api.delete(`/locations/${id}`)
  },

  // Obtener ubicación actual
  getCurrentLocation: () => {
    return api.get('/locations/current')
  }
}

// Métodos de API para autenticación
export const authAPI = {
  // Login
  login: (credentials) => {
    return api.post('/auth/login', credentials)
  },

  // Registro
  register: (userData) => {
    return api.post('/auth/register', userData)
  },

  // Logout
  logout: () => {
    return api.post('/auth/logout')
  },

  // Renovar token
  refreshToken: (refreshToken) => {
    return api.post('/auth/refresh', { refreshToken })
  },

  // Obtener perfil
  getProfile: () => {
    return api.get('/auth/profile')
  },

  // Actualizar perfil
  updateProfile: (profileData) => {
    return api.put('/auth/profile', profileData)
  },

  // Cambiar contraseña
  changePassword: (passwordData) => {
    return api.put('/auth/change-password', passwordData)
  },

  // Verificar token
  verifyToken: () => {
    return api.get('/auth/verify')
  }
}

// Métodos de API para usuarios
export const usersAPI = {
  // Obtener información del usuario
  getUser: (id) => {
    return api.get(`/users/${id}`)
  },

  // Actualizar información del usuario
  updateUser: (id, userData) => {
    return api.put(`/users/${id}`, userData)
  },

  // Obtener configuración del usuario
  getUserSettings: () => {
    return api.get('/users/settings')
  },

  // Actualizar configuración del usuario
  updateUserSettings: (settings) => {
    return api.put('/users/settings', settings)
  }
}

// Métodos de API para sincronización
export const syncAPI = {
  // Obtener datos para sincronización
  getSyncData: (lastSync) => {
    return api.get('/sync', { params: { lastSync } })
  },

  // Enviar datos para sincronización
  sendSyncData: (data) => {
    return api.post('/sync', data)
  },

  // Verificar estado de sincronización
  checkSyncStatus: () => {
    return api.get('/sync/status')
  }
}

// Métodos de API para notificaciones
export const notificationsAPI = {
  // Obtener notificaciones
  getNotifications: (params = {}) => {
    return api.get('/notifications', { params })
  },

  // Marcar como leída
  markAsRead: (id) => {
    return api.put(`/notifications/${id}/read`)
  },

  // Marcar todas como leídas
  markAllAsRead: () => {
    return api.put('/notifications/read-all')
  },

  // Eliminar notificación
  deleteNotification: (id) => {
    return api.delete(`/notifications/${id}`)
  }
}

// Métodos de API para configuración
export const configAPI = {
  // Obtener configuración de la aplicación
  getAppConfig: () => {
    return api.get('/config/app')
  },

  // Obtener configuración del usuario
  getUserConfig: () => {
    return api.get('/config/user')
  },

  // Actualizar configuración del usuario
  updateUserConfig: (config) => {
    return api.put('/config/user', config)
  }
}

// Exportar instancia de axios y métodos
export default api
export {
  photosApiTemp,
  locationsAPI,
  authAPI,
  usersAPI,
  syncAPI,
  notificationsAPI,
  configAPI
} 