import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { toast } from 'vue-toastification'

// Configuración base de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor de solicitudes
api.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación si existe
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    // Agregar timestamp para evitar caché
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }

    // Mostrar loading para solicitudes que no sean GET
    if (config.method !== 'get') {
      const appStore = useAppStore()
      appStore.setLoading(true)
    }

    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
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
    // Ocultar loading
    const appStore = useAppStore()
    appStore.setLoading(false)

    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  async (error) => {
    // Ocultar loading
    const appStore = useAppStore()
    appStore.setLoading(false)

    const originalRequest = error.config
    const authStore = useAuthStore()

    console.error('Error en interceptor de respuesta:', error)

    // Manejar errores de autenticación
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Intentar renovar el token
        await authStore.refreshToken()
        
        // Reintentar la solicitud original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${authStore.token}`
        return api(originalRequest)
      } catch (refreshError) {
        // Si falla la renovación, hacer logout
        console.error('Error al renovar token:', refreshError)
        await authStore.logout(false)
        return Promise.reject(error)
      }
    }

    // Manejar errores de permisos
    if (error.response?.status === 403) {
      toast.error('No tienes permisos para realizar esta acción')
      return Promise.reject(error)
    }

    // Manejar errores de validación
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors
      if (validationErrors) {
        Object.values(validationErrors).forEach(messages => {
          if (Array.isArray(messages)) {
            messages.forEach(message => toast.error(message))
          } else {
            toast.error(messages)
          }
        })
      }
      return Promise.reject(error)
    }

    // Manejar errores de servidor
    if (error.response?.status >= 500) {
      toast.error('Error del servidor. Por favor, inténtelo más tarde.')
      return Promise.reject(error)
    }

    // Manejar errores de red
    if (!error.response) {
      toast.error('Error de conexión. Verifique su conexión a internet.')
      return Promise.reject(error)
    }

    // Manejar otros errores
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido'
    toast.error(errorMessage)

    return Promise.reject(error)
  }
)

// Configurar timeout para solicitudes largas
api.defaults.timeout = 30000

// Configurar retry para solicitudes fallidas
api.defaults.retry = 3
api.defaults.retryDelay = 1000

// Función para reintentar solicitudes
const retryRequest = async (config, retryCount = 0) => {
  try {
    return await api(config)
  } catch (error) {
    if (retryCount < (config.retry || 3) && error.response?.status >= 500) {
      await new Promise(resolve => setTimeout(resolve, config.retryDelay || 1000))
      return retryRequest(config, retryCount + 1)
    }
    throw error
  }
}

// Métodos de API específicos para diferentes recursos

// Autenticación
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
}

// Usuarios
export const usersAPI = {
  list: (params) => api.get('/users', { params }),
  show: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  bulkDelete: (ids) => api.post('/users/bulk-delete', { ids }),
  export: (params) => api.get('/users/export', { 
    params, 
    responseType: 'blob' 
  }),
  import: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// Fotos
export const photosAPI = {
  list: (params) => api.get('/photos', { params }),
  show: (id) => api.get(`/photos/${id}`),
  create: (data) => api.post('/photos', data),
  update: (id, data) => api.put(`/photos/${id}`, data),
  delete: (id) => api.delete(`/photos/${id}`),
  bulkDelete: (ids) => api.post('/photos/bulk-delete', { ids }),
  upload: (file, metadata = {}) => {
    const formData = new FormData()
    formData.append('photo', file)
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key])
    })
    return api.post('/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        console.log('Upload progress:', percentCompleted)
      }
    })
  },
  download: (id) => api.get(`/photos/${id}/download`, { responseType: 'blob' }),
  export: (params) => api.get('/photos/export', { 
    params, 
    responseType: 'blob' 
  }),
  approve: (id) => api.post(`/photos/${id}/approve`),
  reject: (id, reason) => api.post(`/photos/${id}/reject`, { reason }),
  bulkApprove: (ids) => api.post('/photos/bulk-approve', { ids }),
  bulkReject: (ids, reason) => api.post('/photos/bulk-reject', { ids, reason })
}

// Ubicaciones
export const locationsAPI = {
  list: (params) => api.get('/locations', { params }),
  show: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
  bulkDelete: (ids) => api.post('/locations/bulk-delete', { ids }),
  export: (params) => api.get('/locations/export', { 
    params, 
    responseType: 'blob' 
  }),
  import: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/locations/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// Reportes
export const reportsAPI = {
  dashboard: () => api.get('/reports/dashboard'),
  photos: (params) => api.get('/reports/photos', { params }),
  users: (params) => api.get('/reports/users', { params }),
  locations: (params) => api.get('/reports/locations', { params }),
  analytics: (params) => api.get('/reports/analytics', { params }),
  export: (type, params) => api.get(`/reports/${type}/export`, { 
    params, 
    responseType: 'blob' 
  })
}

// Configuración
export const configAPI = {
  system: () => api.get('/config/system'),
  updateSystem: (data) => api.put('/config/system', data),
  user: () => api.get('/config/user'),
  updateUser: (data) => api.put('/config/user', data),
  backup: () => api.post('/config/backup'),
  restore: (file) => {
    const formData = new FormData()
    formData.append('backup', file)
    return api.post('/config/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// Logs
export const logsAPI = {
  audit: (params) => api.get('/logs/audit', { params }),
  system: (params) => api.get('/logs/system', { params }),
  export: (type, params) => api.get(`/logs/${type}/export`, { 
    params, 
    responseType: 'blob' 
  }),
  clear: (type) => api.delete(`/logs/${type}`)
}

// Utilidades
export const utilsAPI = {
  upload: (file, type = 'general') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    return api.post('/utils/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  generateQR: (data) => api.post('/utils/generate-qr', data),
  validateEmail: (email) => api.post('/utils/validate-email', { email }),
  validatePhone: (phone) => api.post('/utils/validate-phone', { phone }),
  geocode: (address) => api.get('/utils/geocode', { params: { address } }),
  reverseGeocode: (lat, lng) => api.get('/utils/reverse-geocode', { 
    params: { lat, lng } 
  })
}

// Exportar instancia de axios y APIs específicas
export default api
export {
  authAPI,
  usersAPI,
  photosAPI,
  locationsAPI,
  reportsAPI,
  configAPI,
  logsAPI,
  utilsAPI,
  retryRequest
} 