import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'
import api from '@/api'
import { encryptData, decryptData } from '@/utils/crypto'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref(null)
  const token = ref(null)
  const refreshToken = ref(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const permissions = ref([])
  const roles = ref([])
  const lastActivity = ref(null)
  const sessionTimeout = ref(30 * 60 * 1000) // 30 minutos

  // Router
  const router = useRouter()
  const { success, error, info, warning } = useNotifications()

  // Getters
  const hasPermission = computed(() => (permission) => {
    return permissions.value.includes(permission)
  })

  const hasAnyPermission = computed(() => (permissionList) => {
    return permissionList.some(permission => permissions.value.includes(permission))
  })

  const hasAllPermissions = computed(() => (permissionList) => {
    return permissionList.every(permission => permissions.value.includes(permission))
  })

  const hasRole = computed(() => (role) => {
    return roles.value.includes(role)
  })

  const hasAnyRole = computed(() => (roleList) => {
    return roleList.some(role => roles.value.includes(role))
  })

  const isAdmin = computed(() => {
    return roles.value.includes('admin') || roles.value.includes('super_admin')
  })

  const isSuperAdmin = computed(() => {
    return roles.value.includes('super_admin')
  })

  const canManageUsers = computed(() => {
    return hasAnyPermission.value(['users:create', 'users:update', 'users:delete'])
  })

  const canManagePhotos = computed(() => {
    return hasAnyPermission.value(['photos:create', 'photos:update', 'photos:delete'])
  })

  const canViewReports = computed(() => {
    return hasPermission.value('reports:view')
  })

  const canExportData = computed(() => {
    return hasPermission.value('data:export')
  })

  // Acciones
  const login = async (credentials) => {
    try {
      isLoading.value = true
      
      const response = await api.post('/auth/login', credentials)
      
      // Verificar que la respuesta tenga la estructura esperada
      if (!response.data.success || !response.data.data) {
        throw new Error('Respuesta del servidor inválida')
      }

      const { user: userData, tokens } = response.data.data
      const { accessToken, refreshToken: refreshTokenData } = tokens

      // Verificar que userData existe
      if (!userData) {
        throw new Error('Datos de usuario no recibidos')
      }

      // Guardar datos en el store
      user.value = userData
      token.value = accessToken
      refreshToken.value = refreshTokenData
      permissions.value = userData.permissions || []
      roles.value = userData.roles || [userData.role]
      isAuthenticated.value = true
      lastActivity.value = Date.now()

      // Guardar en localStorage (encriptado)
      const authData = {
        user: userData,
        token: accessToken,
        refreshToken: refreshTokenData,
        permissions: userData.permissions || [],
        roles: userData.roles || [userData.role],
        lastActivity: lastActivity.value
      }
      
      localStorage.setItem('auth_data', encryptData(JSON.stringify(authData)))

      // Configurar token en axios
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

      // Mostrar mensaje de éxito
      const displayName = userData.nombre && userData.apellido 
        ? `${userData.nombre} ${userData.apellido}`
        : userData.username || 'Usuario'
      success(`Bienvenido, ${displayName}`)

      // Redirigir al dashboard o a la página solicitada
      const redirectPath = router.currentRoute.value.query.redirect || '/'
      router.push(redirectPath)

      return { success: true, user: userData }

    } catch (errorFn) {
      console.error('Error en login:', errorFn)
      let errorMessage = 'Error al iniciar sesión'
      if (errorFn.response?.data?.message) {
        errorMessage = errorFn.response.data.message
      } else if (errorFn.message) {
        errorMessage = errorFn.message
      }
      error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (showMessage = true) => {
    try {
      // Llamar al endpoint de logout si hay token
      if (token.value) {
        await api.post('/auth/logout', { refreshToken: refreshToken.value })
      }
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      // Limpiar estado local
      clearAuthData()
      
      // Mostrar mensaje
      if (showMessage) {
        info('Sesión cerrada correctamente')
      }

      // Redirigir al login
      router.push('/auth/login')
    }
  }

  const refreshTokenAction = async () => {
    try {
      // Si no hay refresh token, intentar cargar desde localStorage
      if (!refreshToken.value) {
        const loaded = loadAuthFromStorage()
        if (!loaded || !refreshToken.value) {
          // No hay sesión válida, redirigir al login
          console.log('No hay sesión válida, redirigiendo al login')
          clearAuthData()
          router.push('/login')
          return { success: false, error: 'No hay sesión válida' }
        }
      }

      const response = await api.post('/auth/refresh', {
        refreshToken: refreshToken.value
      })

      // Verificar que la respuesta tenga la estructura esperada
      if (!response.data.success || !response.data.data) {
        throw new Error('Respuesta del servidor inválida')
      }

      const { accessToken: newToken } = response.data.data
      const newRefreshToken = refreshToken.value // El refresh token no cambia en esta implementación

      // Actualizar tokens
      token.value = newToken
      refreshToken.value = newRefreshToken
      lastActivity.value = Date.now()

      // Actualizar en localStorage
      const authData = {
        user: user.value,
        token: newToken,
        refreshToken: newRefreshToken,
        permissions: permissions.value,
        roles: roles.value,
        lastActivity: lastActivity.value
      }
      
      localStorage.setItem('auth_data', encryptData(JSON.stringify(authData)))

      // Actualizar header de axios
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

      return { success: true }

    } catch (error) {
      console.error('Error al renovar token:', error)
      
      // Si falla la renovación, limpiar datos y redirigir al login
      clearAuthData()
      router.push('/login')
      return { success: false, error: 'Sesión expirada' }
    }
  }

  const forgotPassword = async (email) => {
    try {
      isLoading.value = true
      
      await api.post('/auth/forgot-password', { email })
      
      success('Se ha enviado un enlace de recuperación a tu correo electrónico')
      return { success: true }

    } catch (error) {
      console.error('Error en forgot password:', error)
      
      let errorMessage = 'Error al enviar el enlace de recuperación'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      error(errorMessage)
      return { success: false, error: errorMessage }

    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async (token, password, passwordConfirmation) => {
    try {
      isLoading.value = true
      
      await api.post('/auth/reset-password', {
        token,
        password,
        passwordConfirmation
      })
      
      success('Contraseña actualizada correctamente')
      router.push('/auth/login')
      return { success: true }

    } catch (error) {
      console.error('Error en reset password:', error)
      
      let errorMessage = 'Error al restablecer la contraseña'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      error(errorMessage)
      return { success: false, error: errorMessage }

    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (currentPassword, newPassword, newPasswordConfirmation) => {
    try {
      isLoading.value = true
      
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        newPasswordConfirmation
      })
      
      success('Contraseña actualizada correctamente')
      return { success: true }

    } catch (error) {
      console.error('Error en change password:', error)
      
      let errorMessage = 'Error al cambiar la contraseña'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      error(errorMessage)
      return { success: false, error: errorMessage }

    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (profileData) => {
    try {
      isLoading.value = true
      
      const response = await api.put('/auth/profile', profileData)
      const updatedUser = response.data.user

      // Actualizar usuario en el store
      user.value = updatedUser

      // Actualizar en localStorage
      const authData = {
        user: updatedUser,
        token: token.value,
        refreshToken: refreshToken.value,
        permissions: permissions.value,
        roles: roles.value,
        lastActivity: lastActivity.value
      }
      
      localStorage.setItem('auth_data', encryptData(JSON.stringify(authData)))

      success('Perfil actualizado correctamente')
      return { success: true, user: updatedUser }

    } catch (error) {
      console.error('Error en update profile:', error)
      
      let errorMessage = 'Error al actualizar el perfil'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      error(errorMessage)
      return { success: false, error: errorMessage }

    } finally {
      isLoading.value = false
    }
  }

  const loadAuthFromStorage = () => {
    try {
      const authDataString = localStorage.getItem('auth_data')
      if (!authDataString) return false

      const authData = JSON.parse(decryptData(authDataString))
      
      // Verificar si la sesión no ha expirado
      const now = Date.now()
      const lastActivityTime = authData.lastActivity || 0
      
      if (now - lastActivityTime > sessionTimeout.value) {
        // Sesión expirada
        clearAuthData()
        return false
      }

      // Restaurar datos
      user.value = authData.user
      token.value = authData.token
      refreshToken.value = authData.refreshToken
      permissions.value = authData.permissions || []
      roles.value = authData.roles || []
      isAuthenticated.value = true
      lastActivity.value = authData.lastActivity

      // Configurar token en axios
      api.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`

      return true

    } catch (error) {
      console.error('Error al cargar datos de autenticación:', error)
      clearAuthData()
      return false
    }
  }

  const clearAuthData = () => {
    user.value = null
    token.value = null
    refreshToken.value = null
    isAuthenticated.value = false
    permissions.value = []
    roles.value = []
    lastActivity.value = null

    // Limpiar localStorage
    localStorage.removeItem('auth_data')

    // Limpiar header de axios
    delete api.defaults.headers.common['Authorization']
  }

  const updateLastActivity = () => {
    lastActivity.value = Date.now()
    
    // Actualizar en localStorage
    if (isAuthenticated.value) {
      const authData = {
        user: user.value,
        token: token.value,
        refreshToken: refreshToken.value,
        permissions: permissions.value,
        roles: roles.value,
        lastActivity: lastActivity.value
      }
      
      localStorage.setItem('auth_data', encryptData(JSON.stringify(authData)))
    }
  }

  const checkSessionTimeout = () => {
    if (!isAuthenticated.value || !lastActivity.value) return

    const now = Date.now()
    const timeSinceLastActivity = now - lastActivity.value

    if (timeSinceLastActivity > sessionTimeout.value) {
      warning('Tu sesión ha expirado por inactividad')
      logout(false)
    }
  }

  // Configurar verificación periódica de timeout
  let sessionCheckInterval = null

  const startSessionMonitoring = () => {
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval)
    }

    sessionCheckInterval = setInterval(() => {
      checkSessionTimeout()
    }, 60000) // Verificar cada minuto
  }

  const stopSessionMonitoring = () => {
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval)
      sessionCheckInterval = null
    }
  }

  // Inicializar autenticación
  const initializeAuth = () => {
    try {
      // Intentar cargar sesión desde localStorage
      const sessionLoaded = loadAuthFromStorage()
      
      if (sessionLoaded) {
        console.log('Sesión cargada correctamente')
        // Iniciar monitoreo de sesión
        startSessionMonitoring()
      } else {
        console.log('No hay sesión válida, redirigiendo al login')
        // Redirigir al login si no hay sesión válida
        router.push('/login')
      }
      
      return sessionLoaded
    } catch (error) {
      console.error('Error al inicializar autenticación:', error)
      clearAuthData()
      // Redirigir al login en caso de error
      router.push('/login')
      return false
    }
  }

  return {
    // Estado
    user,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    permissions,
    roles,
    lastActivity,
    sessionTimeout,

    // Getters
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
    canManageUsers,
    canManagePhotos,
    canViewReports,
    canExportData,

    // Acciones
    login,
    logout,
    refreshTokenAction,
    refreshToken: refreshTokenAction, // alias para compatibilidad
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    loadAuthFromStorage,
    clearAuthData,
    updateLastActivity,
    checkSessionTimeout,
    startSessionMonitoring,
    stopSessionMonitoring,
    initializeAuth
  }
}) 