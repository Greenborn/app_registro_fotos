import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'

export const useAppStore = defineStore('app', () => {
  const toast = useToast()
  // Estado general
  const loading = ref(false)
  const loadingMessage = ref('')
  const isOnline = ref(navigator.onLine)
  const appState = ref('foreground') // foreground, background
  const orientation = ref('portrait') // portrait, landscape
  const appMode = ref('normal') // normal, camera, map
  const gpsStatus = ref('inactive') // inactive, active, error
  const cameraStatus = ref('inactive') // inactive, active, error
  const theme = ref('light') // light, dark, auto
  const language = ref('es') // es, en
  const notifications = ref(true)
  const soundEnabled = ref(true)
  const vibrationEnabled = ref(true)
  const autoUpload = ref(true)
  const imageQuality = ref('high') // low, medium, high
  const maxImageSize = ref(5) // MB
  const gpsAccuracy = ref('high') // low, medium, high
  const gpsTimeout = ref(10000) // ms
  const gpsMaxAge = ref(60000) // ms

  // Estado de confirmaciones
  const confirmation = ref({
    show: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    loading: false,
    onConfirm: null
  })

  // Estado de notificaciones
  const notificationsList = ref([])
  const unreadCount = ref(0)

  // Estado de errores
  const errors = ref([])
  const warnings = ref([])

  // Computed
  const isDarkMode = computed(() => {
    if (theme.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme.value === 'dark'
  })

  const isLandscape = computed(() => orientation.value === 'landscape')
  const isPortrait = computed(() => orientation.value === 'portrait')
  const isCameraMode = computed(() => appMode.value === 'camera')
  const isMapMode = computed(() => appMode.value === 'map')
  const isGpsActive = computed(() => gpsStatus.value === 'active')
  const isCameraActive = computed(() => cameraStatus.value === 'active')

  // Métodos de loading
  const setLoading = (status, message = '') => {
    loading.value = status
    loadingMessage.value = message
  }

  const showLoading = (message = 'Cargando...') => {
    setLoading(true, message)
  }

  const hideLoading = () => {
    setLoading(false)
  }

  // Métodos de estado de la aplicación
  const setOnlineStatus = (status) => {
    isOnline.value = status
    if (!status) {
      toast.warning('Sin conexión a internet')
    } else {
      toast.success('Conexión restaurada')
    }
  }

  const setAppState = (state) => {
    appState.value = state
    console.log('App state changed:', state)
  }

  const setOrientation = (newOrientation) => {
    orientation.value = newOrientation
    console.log('Orientation changed:', newOrientation)
  }

  const setAppMode = (mode) => {
    appMode.value = mode
    console.log('App mode changed:', mode)
  }

  // Métodos de GPS
  const setGpsStatus = (status) => {
    gpsStatus.value = status
    console.log('GPS status changed:', status)
  }

  const requestGpsPermission = async () => {
    try {
      if (!navigator.geolocation) {
        setGpsStatus('error')
        toast.error('Geolocalización no disponible en este dispositivo')
        return false
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: gpsAccuracy.value === 'high',
          timeout: gpsTimeout.value,
          maximumAge: gpsMaxAge.value
        })
      })

      setGpsStatus('active')
      toast.success('GPS activado')
      return position
    } catch (error) {
      setGpsStatus('error')
      console.error('Error al obtener GPS:', error)
      
      let message = 'Error al obtener ubicación'
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = 'Permiso de ubicación denegado'
          break
        case error.POSITION_UNAVAILABLE:
          message = 'Información de ubicación no disponible'
          break
        case error.TIMEOUT:
          message = 'Tiempo de espera agotado'
          break
      }
      
      toast.error(message)
      return false
    }
  }

  // Métodos de cámara
  const setCameraStatus = (status) => {
    cameraStatus.value = status
    console.log('Camera status changed:', status)
  }

  const requestCameraPermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus('error')
        toast.error('Cámara no disponible en este dispositivo')
        return false
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      })

      setCameraStatus('active')
      toast.success('Cámara activada')
      return stream
    } catch (error) {
      setCameraStatus('error')
      console.error('Error al acceder a la cámara:', error)
      
      let message = 'Error al acceder a la cámara'
      if (error.name === 'NotAllowedError') {
        message = 'Permiso de cámara denegado'
      } else if (error.name === 'NotFoundError') {
        message = 'No se encontró cámara'
      } else if (error.name === 'NotReadableError') {
        message = 'Cámara en uso por otra aplicación'
      }
      
      toast.error(message)
      return false
    }
  }

  // Métodos de configuración
  const setTheme = (newTheme) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    
    // Aplicar tema
    if (newTheme === 'dark' || (newTheme === 'auto' && isDarkMode.value)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const setLanguage = (newLanguage) => {
    language.value = newLanguage
    localStorage.setItem('language', newLanguage)
    // Aquí se podría implementar i18n
  }

  const setNotifications = (enabled) => {
    notifications.value = enabled
    localStorage.setItem('notifications', enabled)
  }

  const setSoundEnabled = (enabled) => {
    soundEnabled.value = enabled
    localStorage.setItem('soundEnabled', enabled)
  }

  const setVibrationEnabled = (enabled) => {
    vibrationEnabled.value = enabled
    localStorage.setItem('vibrationEnabled', enabled)
  }

  const setAutoUpload = (enabled) => {
    autoUpload.value = enabled
    localStorage.setItem('autoUpload', enabled)
  }

  const setImageQuality = (quality) => {
    imageQuality.value = quality
    localStorage.setItem('imageQuality', quality)
  }

  const setMaxImageSize = (size) => {
    maxImageSize.value = size
    localStorage.setItem('maxImageSize', size)
  }

  const setGpsAccuracy = (accuracy) => {
    gpsAccuracy.value = accuracy
    localStorage.setItem('gpsAccuracy', accuracy)
  }

  const setGpsTimeout = (timeout) => {
    gpsTimeout.value = timeout
    localStorage.setItem('gpsTimeout', timeout)
  }

  const setGpsMaxAge = (maxAge) => {
    gpsMaxAge.value = maxAge
    localStorage.setItem('gpsMaxAge', maxAge)
  }

  // Métodos de confirmación
  const showConfirmation = (options) => {
    confirmation.value = {
      show: true,
      title: options.title || 'Confirmar',
      message: options.message || '',
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      loading: false,
      onConfirm: options.onConfirm || null
    }
  }

  const hideConfirmation = () => {
    confirmation.value.show = false
  }

  const setConfirmationLoading = (loading) => {
    confirmation.value.loading = loading
  }

  // Métodos de notificaciones
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    }
    
    notificationsList.value.unshift(newNotification)
    
    if (!newNotification.read) {
      unreadCount.value++
    }
    
    // Limitar a 50 notificaciones
    if (notificationsList.value.length > 50) {
      notificationsList.value = notificationsList.value.slice(0, 50)
    }
  }

  const markNotificationAsRead = (id) => {
    const notification = notificationsList.value.find(n => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      unreadCount.value--
    }
  }

  const markAllNotificationsAsRead = () => {
    notificationsList.value.forEach(notification => {
      notification.read = true
    })
    unreadCount.value = 0
  }

  const removeNotification = (id) => {
    const index = notificationsList.value.findIndex(n => n.id === id)
    if (index !== -1) {
      const notification = notificationsList.value[index]
      if (!notification.read) {
        unreadCount.value--
      }
      notificationsList.value.splice(index, 1)
    }
  }

  const clearNotifications = () => {
    notificationsList.value = []
    unreadCount.value = 0
  }

  // Métodos de errores y advertencias
  const addError = (error) => {
    const newError = {
      id: Date.now(),
      timestamp: new Date(),
      ...error
    }
    errors.value.unshift(newError)
    
    // Limitar a 20 errores
    if (errors.value.length > 20) {
      errors.value = errors.value.slice(0, 20)
    }
  }

  const addWarning = (warning) => {
    const newWarning = {
      id: Date.now(),
      timestamp: new Date(),
      ...warning
    }
    warnings.value.unshift(newWarning)
    
    // Limitar a 20 advertencias
    if (warnings.value.length > 20) {
      warnings.value = warnings.value.slice(0, 20)
    }
  }

  const clearErrors = () => {
    errors.value = []
  }

  const clearWarnings = () => {
    warnings.value = []
  }

  // Métodos de utilidad
  const vibrate = (pattern = 100) => {
    if (vibrationEnabled.value && navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  }

  const playSound = (type = 'notification') => {
    if (soundEnabled.value) {
      // Implementar sonidos según el tipo
      console.log('Playing sound:', type)
    }
  }

  const showToast = (message, type = 'info') => {
    if (notifications.value) {
      toast[type](message)
    }
  }

  // Cargar configuración desde localStorage
  const loadSettings = () => {
    const savedTheme = localStorage.getItem('theme')
    const savedLanguage = localStorage.getItem('language')
    const savedNotifications = localStorage.getItem('notifications')
    const savedSoundEnabled = localStorage.getItem('soundEnabled')
    const savedVibrationEnabled = localStorage.getItem('vibrationEnabled')
    const savedAutoUpload = localStorage.getItem('autoUpload')
    const savedImageQuality = localStorage.getItem('imageQuality')
    const savedMaxImageSize = localStorage.getItem('maxImageSize')
    const savedGpsAccuracy = localStorage.getItem('gpsAccuracy')
    const savedGpsTimeout = localStorage.getItem('gpsTimeout')
    const savedGpsMaxAge = localStorage.getItem('gpsMaxAge')

    if (savedTheme) setTheme(savedTheme)
    if (savedLanguage) setLanguage(savedLanguage)
    if (savedNotifications !== null) setNotifications(savedNotifications === 'true')
    if (savedSoundEnabled !== null) setSoundEnabled(savedSoundEnabled === 'true')
    if (savedVibrationEnabled !== null) setVibrationEnabled(savedVibrationEnabled === 'true')
    if (savedAutoUpload !== null) setAutoUpload(savedAutoUpload === 'true')
    if (savedImageQuality) setImageQuality(savedImageQuality)
    if (savedMaxImageSize) setMaxImageSize(parseInt(savedMaxImageSize))
    if (savedGpsAccuracy) setGpsAccuracy(savedGpsAccuracy)
    if (savedGpsTimeout) setGpsTimeout(parseInt(savedGpsTimeout))
    if (savedGpsMaxAge) setGpsMaxAge(parseInt(savedGpsMaxAge))
  }

  return {
    // Estado
    loading,
    loadingMessage,
    isOnline,
    appState,
    orientation,
    appMode,
    gpsStatus,
    cameraStatus,
    theme,
    language,
    notifications,
    soundEnabled,
    vibrationEnabled,
    autoUpload,
    imageQuality,
    maxImageSize,
    gpsAccuracy,
    gpsTimeout,
    gpsMaxAge,
    confirmation,
    notificationsList,
    unreadCount,
    errors,
    warnings,

    // Computed
    isDarkMode,
    isLandscape,
    isPortrait,
    isCameraMode,
    isMapMode,
    isGpsActive,
    isCameraActive,

    // Métodos
    setLoading,
    showLoading,
    hideLoading,
    setOnlineStatus,
    setAppState,
    setOrientation,
    setAppMode,
    setGpsStatus,
    requestGpsPermission,
    setCameraStatus,
    requestCameraPermission,
    setTheme,
    setLanguage,
    setNotifications,
    setSoundEnabled,
    setVibrationEnabled,
    setAutoUpload,
    setImageQuality,
    setMaxImageSize,
    setGpsAccuracy,
    setGpsTimeout,
    setGpsMaxAge,
    showConfirmation,
    hideConfirmation,
    setConfirmationLoading,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearNotifications,
    addError,
    addWarning,
    clearErrors,
    clearWarnings,
    vibrate,
    playSound,
    showToast,
    loadSettings
  }
}) 