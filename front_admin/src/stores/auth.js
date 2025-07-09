import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-toastification'
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
      const { user: userData, token: accessToken, refreshToken: refreshTokenData, permissions: userPermissions, roles: userRoles } = response.data

      // Guardar datos en el store
      user.value = userData
      token.value = accessToken
      refreshToken.value = refreshTokenData
      permissions.value = userPermissions
      roles.value = userRoles
      isAuthenticated.value = true
      lastActivity.value = Date.now()

      // Guardar en localStorage (encriptado)
      const authData = {
        user: userData,
        token: accessToken,
        refreshToken: refreshTokenData,
        permissions: userPermissions,
        roles: userRoles,
        lastActivity: lastActivity.value
      }
      
      localStorage.setItem('auth_data', encryptData(JSON.stringify(authData)))

      // Configurar token en axios
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

      // Mostrar mensaje de éxito
      toast.success(`Bienvenido, ${userData.nombre} ${userData.apellido}`)

      // Redirigir al dashboard o a la página solicitada
      const redirectPath = router.currentRoute.value.query.redirect || '/'
      router.push(redirectPath)

      return { success: true, user: userData }

    } catch (error) {
      console.error('Error en login:', error)
      
      let errorMessage = 'Error al iniciar sesión'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
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
        toast.info('Sesión cerrada correctamente')
      }

      // Redirigir al login
      router.push('/auth/login')
    }
  }

  const refreshTokenAction = async () => {
    try {
      if (!refreshToken.value) {
        throw new Error('No hay refresh token disponible')
      }

      const response = await api.post('/auth/refresh', {
        refreshToken: refreshToken.value
      })

      const { token: newToken, refreshToken: newRefreshToken } = response.data

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
      
      // Si falla la renovación, hacer logout
      await logout(false)
      throw error
    }
  }

  const forgotPassword = async (email) => {
    try {
      isLoading.value = true
      
      await api.post('/auth/forgot-password', { email })
      
      toast.success('Se ha enviado un enlace de recuperación a tu correo electrónico')
      return { success: true }

    } catch (error) {
      console.error('Error en forgot password:', error)
      
      let errorMessage = 'Error al enviar el enlace de recuperación'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      toast.error(errorMessage)
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
      
      toast.success('Contraseña actualizada correctamente')
      router.push('/auth/login')
      return { success: true }

    } catch (error) {
      console.error('Error en reset password:', error)
      
      let errorMessage = 'Error al restablecer la contraseña'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      toast.error(errorMessage)
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
      
      toast.success('Contraseña actualizada correctamente')
      return { success: true }

    } catch (error) {
      console.error('Error en change password:', error)
      
      let errorMessage = 'Error al cambiar la contraseña'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      toast.error(errorMessage)
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

      toast.success('Perfil actualizado correctamente')
      return { success: true, user: updatedUser }

    } catch (error) {
      console.error('Error en update profile:', error)
      
      let errorMessage = 'Error al actualizar el perfil'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      toast.error(errorMessage)
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
      toast.warning('Tu sesión ha expirado por inactividad')
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
    refreshToken: refreshTokenAction,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    loadAuthFromStorage,
    clearAuthData,
    updateLastActivity,
    checkSessionTimeout,
    startSessionMonitoring,
    stopSessionMonitoring
  }
}) 