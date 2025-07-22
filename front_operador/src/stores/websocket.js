import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io } from 'socket.io-client'
import { useToast } from 'vue-toastification'
import { useAuthStore } from './auth'
import { useAppStore } from './app'

export const useWebSocketStore = defineStore('websocket', () => {
  const toast = useToast()
  // Estado
  const socket = ref(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionError = ref(null)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = ref(5)
  const reconnectDelay = ref(1000)
  const messages = ref([])
  const pendingMessages = ref([])

  // Computed
  const canConnect = computed(() => {
    const authStore = useAuthStore()
    const appStore = useAppStore()
    return authStore.isAuthenticated && appStore.isOnline && !isConnecting.value
  })

  const shouldReconnect = computed(() => {
    return reconnectAttempts.value < maxReconnectAttempts.value
  })

  // Métodos de conexión
  const connect = async () => {
    if (isConnected.value || isConnecting.value) {
      return
    }

    const authStore = useAuthStore()
    const appStore = useAppStore()

    if (!authStore.isAuthenticated) {
      console.warn('No se puede conectar: usuario no autenticado')
      return
    }

    if (!appStore.isOnline) {
      console.warn('No se puede conectar: sin conexión a internet')
      return
    }

    try {
      isConnecting.value = true
      connectionError.value = null

      // Crear conexión WebSocket
      const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000'
      
      socket.value = io(socketUrl, {
        auth: {
          token: authStore.accessToken
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        reconnection: false // Manejar reconexión manualmente
      })

      // Configurar eventos
      setupSocketEvents()

      // Esperar conexión
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout de conexión'))
        }, 10000)

        socket.value.on('connect', () => {
          clearTimeout(timeout)
          resolve()
        })

        socket.value.on('connect_error', (error) => {
          clearTimeout(timeout)
          reject(error)
        })
      })

      isConnected.value = true
      isConnecting.value = false
      reconnectAttempts.value = 0
      connectionError.value = null

      console.log('WebSocket conectado')
      
      // Enviar mensajes pendientes
      sendPendingMessages()

    } catch (error) {
      console.error('Error al conectar WebSocket:', error)
      isConnecting.value = false
      connectionError.value = error.message
      
      // Intentar reconexión si es apropiado
      if (shouldReconnect.value) {
        scheduleReconnect()
      }
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
    
    isConnected.value = false
    isConnecting.value = false
    connectionError.value = null
    reconnectAttempts.value = 0
    
    console.log('WebSocket desconectado')
  }

  const reconnect = async () => {
    if (isConnecting.value) {
      return
    }

    if (!shouldReconnect.value) {
      console.warn('Máximo número de intentos de reconexión alcanzado')
      return
    }

    reconnectAttempts.value++
    console.log(`Intento de reconexión ${reconnectAttempts.value}/${maxReconnectAttempts.value}`)

    // Esperar antes de reconectar
    await new Promise(resolve => {
      setTimeout(resolve, reconnectDelay.value * reconnectAttempts.value)
    })

    await connect()
  }

  const scheduleReconnect = () => {
    setTimeout(() => {
      reconnect()
    }, reconnectDelay.value * (reconnectAttempts.value + 1))
  }

  // Configurar eventos del socket
  const setupSocketEvents = () => {
    if (!socket.value) return

    // Conexión
    socket.value.on('connect', () => {
      console.log('WebSocket conectado')
      isConnected.value = true
      isConnecting.value = false
      connectionError.value = null
      reconnectAttempts.value = 0
    })

    // Desconexión
    socket.value.on('disconnect', (reason) => {
      console.log('WebSocket desconectado:', reason)
      isConnected.value = false
      
      if (reason === 'io server disconnect') {
        // Desconexión iniciada por el servidor
        toast.warning('Conexión perdida con el servidor')
      } else if (reason === 'io client disconnect') {
        // Desconexión iniciada por el cliente
        console.log('Desconexión iniciada por el cliente')
      } else {
        // Desconexión por error
        toast.error('Conexión perdida')
        
        // Intentar reconexión
        if (shouldReconnect.value) {
          scheduleReconnect()
        }
      }
    })

    // Error de conexión
    socket.value.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error)
      connectionError.value = error.message
      isConnecting.value = false
      
      if (error.message === 'Invalid token') {
        // Token inválido, no intentar reconectar
        toast.error('Sesión expirada')
        const authStore = useAuthStore()
        authStore.clearAuth()
      } else if (shouldReconnect.value) {
        scheduleReconnect()
      }
    })

    // Eventos específicos de la aplicación
    socket.value.on('photo_uploaded', (data) => {
      console.log('Foto subida:', data)
      addMessage('photo_uploaded', data)
      toast.success('Foto subida correctamente')
    })

    socket.value.on('photo_upload_error', (data) => {
      console.error('Error al subir foto:', data)
      addMessage('photo_upload_error', data)
      toast.error('Error al subir foto')
    })

    socket.value.on('location_updated', (data) => {
      console.log('Ubicación actualizada:', data)
      addMessage('location_updated', data)
    })

    socket.value.on('notification', (data) => {
      console.log('Notificación recibida:', data)
      addMessage('notification', data)
      
      const appStore = useAppStore()
      appStore.addNotification({
        type: data.type || 'info',
        title: data.title || 'Notificación',
        message: data.message || '',
        data: data.data || {}
      })
      
      toast.info(data.message || 'Nueva notificación')
    })

    socket.value.on('status_update', (data) => {
      console.log('Actualización de estado:', data)
      addMessage('status_update', data)
    })

    socket.value.on('sync_request', (data) => {
      console.log('Solicitud de sincronización:', data)
      addMessage('sync_request', data)
      
      // Responder con datos locales si es necesario
      handleSyncRequest(data)
    })
  }

  // Métodos de mensajería
  const sendMessage = (event, data) => {
    if (!isConnected.value || !socket.value) {
      // Guardar mensaje para enviar más tarde
      pendingMessages.value.push({ event, data, timestamp: Date.now() })
      console.log('Mensaje guardado para envío posterior:', event)
      return false
    }

    try {
      socket.value.emit(event, data)
      console.log('Mensaje enviado:', event, data)
      return true
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      return false
    }
  }

  const sendPendingMessages = () => {
    if (pendingMessages.value.length === 0) return

    console.log(`Enviando ${pendingMessages.value.length} mensajes pendientes`)
    
    const messagesToSend = [...pendingMessages.value]
    pendingMessages.value = []

    messagesToSend.forEach(({ event, data }) => {
      sendMessage(event, data)
    })
  }

  const addMessage = (type, data) => {
    const message = {
      id: Date.now(),
      type,
      data,
      timestamp: new Date(),
      direction: 'incoming'
    }

    messages.value.unshift(message)

    // Limitar a 100 mensajes
    if (messages.value.length > 100) {
      messages.value = messages.value.slice(0, 100)
    }
  }

  // Métodos específicos de la aplicación
  const uploadPhoto = (photoData) => {
    return sendMessage('upload_photo', photoData)
  }

  const updateLocation = (locationData) => {
    return sendMessage('update_location', locationData)
  }

  const requestSync = (syncData) => {
    return sendMessage('request_sync', syncData)
  }

  const handleSyncRequest = (data) => {
    // Implementar lógica de sincronización según el tipo
    switch (data.type) {
      case 'photos':
        // Enviar fotos locales no sincronizadas
        break
      case 'location':
        // Enviar ubicación actual
        break
      case 'status':
        // Enviar estado actual
        break
      default:
        console.warn('Tipo de sincronización no reconocido:', data.type)
    }
  }

  // Métodos de utilidad
  const clearMessages = () => {
    messages.value = []
  }

  const clearPendingMessages = () => {
    pendingMessages.value = []
  }

  const getConnectionStatus = () => {
    if (isConnecting.value) return 'connecting'
    if (isConnected.value) return 'connected'
    if (connectionError.value) return 'error'
    return 'disconnected'
  }

  const getConnectionInfo = () => {
    return {
      isConnected: isConnected.value,
      isConnecting: isConnecting.value,
      connectionError: connectionError.value,
      reconnectAttempts: reconnectAttempts.value,
      maxReconnectAttempts: maxReconnectAttempts.value,
      messagesCount: messages.value.length,
      pendingMessagesCount: pendingMessages.value.length
    }
  }

  return {
    // Estado
    socket,
    isConnected,
    isConnecting,
    connectionError,
    reconnectAttempts,
    maxReconnectAttempts,
    reconnectDelay,
    messages,
    pendingMessages,

    // Computed
    canConnect,
    shouldReconnect,

    // Métodos de conexión
    connect,
    disconnect,
    reconnect,

    // Métodos de mensajería
    sendMessage,
    sendPendingMessages,
    addMessage,

    // Métodos específicos
    uploadPhoto,
    updateLocation,
    requestSync,

    // Métodos de utilidad
    clearMessages,
    clearPendingMessages,
    getConnectionStatus,
    getConnectionInfo
  }
}) 