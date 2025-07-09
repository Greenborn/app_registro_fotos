import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-toastification'
import api from '../api'
import { encryptData, decryptData } from '../utils/crypto'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref(null)
  const accessToken = ref(null)
  const refreshToken = ref(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const lastActivity = ref(null)

  // Computed
  const userRole = computed(() => user.value?.role || null)
  const userId = computed(() => user.value?.id || null)
  const userName = computed(() => user.value?.nombre || 'Usuario')
  const userEmail = computed(() => user.value?.email || '')
  const userPermissions = computed(() => user.value?.permisos || [])

  // Métodos
  const login = async (credentials) => {
    try {
      isLoading.value = true
      
      const response = await api.post('/auth/login', credentials)
      const { user: userData, accessToken: token, refreshToken: refresh } = response.data
      
      // Guardar datos encriptados
      const encryptedUser = encryptData(JSON.stringify(userData))
      const encryptedToken = encryptData(token)
      const encryptedRefresh = encryptData(refresh)
      
      localStorage.setItem('user', encryptedUser)
      localStorage.setItem('accessToken', encryptedToken)
      localStorage.setItem('refreshToken', encryptedRefresh)
      
      // Actualizar estado
      user.value = userData
      accessToken.value = token
      refreshToken.value = refresh
      isAuthenticated.value = true
      lastActivity.value = Date.now()
      
      // Configurar token en API
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      toast.success('Inicio de sesión exitoso')
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('Error en login:', error)
      
      const message = error.response?.data?.message || 'Error al iniciar sesión'
      toast.error(message)
      
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData) => {
    try {
      isLoading.value = true
      
      const response = await api.post('/auth/register', userData)
      const { user: newUser, accessToken: token, refreshToken: refresh } = response.data
      
      // Guardar datos encriptados
      const encryptedUser = encryptData(JSON.stringify(newUser))
      const encryptedToken = encryptData(token)
      const encryptedRefresh = encryptData(refresh)
      
      localStorage.setItem('user', encryptedUser)
      localStorage.setItem('accessToken', encryptedToken)
      localStorage.setItem('refreshToken', encryptedRefresh)
      
      // Actualizar estado
      user.value = newUser
      accessToken.value = token
      refreshToken.value = refresh
      isAuthenticated.value = true
      lastActivity.value = Date.now()
      
      // Configurar token en API
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      toast.success('Registro exitoso')
      
      return { success: true, user: newUser }
    } catch (error) {
      console.error('Error en registro:', error)
      
      const message = error.response?.data?.message || 'Error al registrarse'
      toast.error(message)
      
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      // Llamar al endpoint de logout si hay token
      if (accessToken.value) {
        await api.post('/auth/logout')
      }
    } catch (error) {
      console.warn('Error al hacer logout en servidor:', error)
    } finally {
      // Limpiar estado local
      clearAuth()
    }
  }

  const clearAuth = () => {
    // Limpiar localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    
    // Limpiar estado
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    isAuthenticated.value = false
    lastActivity.value = null
    
    // Limpiar headers de API
    delete api.defaults.headers.common['Authorization']
    
    toast.info('Sesión cerrada')
  }

  const refreshAuthToken = async () => {
    try {
      if (!refreshToken.value) {
        throw new Error('No hay refresh token')
      }
      
      const response = await api.post('/auth/refresh', {
        refreshToken: refreshToken.value
      })
      
      const { accessToken: newToken, refreshToken: newRefresh } = response.data
      
      // Guardar nuevos tokens encriptados
      const encryptedToken = encryptData(newToken)
      const encryptedRefresh = encryptData(newRefresh)
      
      localStorage.setItem('accessToken', encryptedToken)
      localStorage.setItem('refreshToken', encryptedRefresh)
      
      // Actualizar estado
      accessToken.value = newToken
      refreshToken.value = newRefresh
      lastActivity.value = Date.now()
      
      // Configurar nuevo token en API
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      return true
    } catch (error) {
      console.error('Error al renovar token:', error)
      clearAuth()
      throw error
    }
  }

  const loadAuthFromStorage = () => {
    try {
      const encryptedUser = localStorage.getItem('user')
      const encryptedToken = localStorage.getItem('accessToken')
      const encryptedRefresh = localStorage.getItem('refreshToken')
      
      if (encryptedUser && encryptedToken && encryptedRefresh) {
        // Desencriptar datos
        const userData = JSON.parse(decryptData(encryptedUser))
        const token = decryptData(encryptedToken)
        const refresh = decryptData(encryptedRefresh)
        
        // Verificar que el token no haya expirado
        if (isTokenExpired(token)) {
          clearAuth()
          return false
        }
        
        // Actualizar estado
        user.value = userData
        accessToken.value = token
        refreshToken.value = refresh
        isAuthenticated.value = true
        lastActivity.value = Date.now()
        
        // Configurar token en API
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error al cargar autenticación:', error)
      clearAuth()
      return false
    }
  }

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = payload.exp * 1000 // Convertir a milisegundos
      const currentTime = Date.now()
      
      // Considerar expirado si falta menos de 5 minutos
      return currentTime >= (expirationTime - 5 * 60 * 1000)
    } catch (error) {
      console.error('Error al verificar expiración del token:', error)
      return true
    }
  }

  const updateUserProfile = async (profileData) => {
    try {
      isLoading.value = true
      
      const response = await api.put(`/auth/profile`, profileData)
      const updatedUser = response.data.user
      
      // Actualizar en localStorage
      const encryptedUser = encryptData(JSON.stringify(updatedUser))
      localStorage.setItem('user', encryptedUser)
      
      // Actualizar estado
      user.value = updatedUser
      
      toast.success('Perfil actualizado correctamente')
      
      return { success: true, user: updatedUser }
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      
      const message = error.response?.data?.message || 'Error al actualizar perfil'
      toast.error(message)
      
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (passwordData) => {
    try {
      isLoading.value = true
      
      await api.put('/auth/change-password', passwordData)
      
      toast.success('Contraseña cambiada correctamente')
      
      return { success: true }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      
      const message = error.response?.data?.message || 'Error al cambiar contraseña'
      toast.error(message)
      
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  const hasPermission = (permission) => {
    return userPermissions.value.includes(permission)
  }

  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => hasPermission(permission))
  }

  const updateLastActivity = () => {
    lastActivity.value = Date.now()
  }

  const checkSessionTimeout = () => {
    const timeout = 30 * 60 * 1000 // 30 minutos
    const now = Date.now()
    
    if (lastActivity.value && (now - lastActivity.value) > timeout) {
      toast.warning('Sesión expirada por inactividad')
      clearAuth()
      return false
    }
    
    return true
  }

  // Interceptor para renovar token automáticamente
  const setupTokenInterceptor = () => {
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          
          try {
            await refreshAuthToken()
            return api(originalRequest)
          } catch (refreshError) {
            clearAuth()
            const router = useRouter()
            router.push('/login')
            throw refreshError
          }
        }
        
        return Promise.reject(error)
      }
    )
  }

  return {
    // Estado
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    lastActivity,
    
    // Computed
    userRole,
    userId,
    userName,
    userEmail,
    userPermissions,
    
    // Métodos
    login,
    register,
    logout,
    clearAuth,
    refreshAuthToken,
    loadAuthFromStorage,
    updateUserProfile,
    changePassword,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    updateLastActivity,
    checkSessionTimeout,
    setupTokenInterceptor
  }
}) 