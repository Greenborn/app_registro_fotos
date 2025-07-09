import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io } from 'socket.io-client'
import { useAuthStore } from './auth'
import { useAppStore } from './app'
import { toast } from 'vue-toastification'

export const useWebSocketStore = defineStore('websocket', () => {
  // Estado
  const socket = ref(null)
  const connected = ref(false)
  const reconnecting = ref(false)
  const connectionAttempts = ref(0)
  const maxReconnectionAttempts = ref(5)
  const reconnectionDelay = ref(1000)
  const messages = ref([])
  const rooms = ref([])
  const typingUsers = ref({})

  // Stores
  const authStore = useAuthStore()
  const appStore = useAppStore()

  // Getters
  const isConnected = computed(() => connected.value)
  const isReconnecting = computed(() => reconnecting.value)
  const connectionStatus = computed(() => {
    if (connected.value) return 'connected'
    if (reconnecting.value) return 'reconnecting'
    return 'disconnected'
  })

  const messageCount = computed(() => messages.value.length)
  const unreadMessageCount = computed(() => {
    return messages.value.filter(msg => !msg.read).length
  })

  const activeRooms = computed(() => {
    return rooms.value.filter(room => room.active)
  })

  // Acciones
  const connect = () => {
    if (socket.value && connected.value) {
      console.log('WebSocket ya está conectado')
      return
    }

    if (!authStore.token) {
      console.warn('No hay token de autenticación para conectar WebSocket')
      return
    }

    try {
      // Crear conexión Socket.IO
      socket.value = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
        auth: {
          token: authStore.token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: maxReconnectionAttempts.value,
        reconnectionDelay: reconnectionDelay.value,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: true
      })

      // Configurar event listeners
      setupEventListeners()

      console.log('Intentando conectar WebSocket...')

    } catch (error) {
      console.error('Error al crear conexión WebSocket:', error)
      appStore.addRealTimeNotification({
        type: 'error',
        title: 'Error de Conexión',
        message: 'No se pudo establecer la conexión en tiempo real'
      })
    }
  }

  const disconnect = () => {
    if (socket.value) {
      console.log('Desconectando WebSocket...')
      socket.value.disconnect()
      socket.value = null
    }
    
    connected.value = false
    reconnecting.value = false
    connectionAttempts.value = 0
    appStore.setWsConnected(false)
    appStore.setWsReconnecting(false)
  }

  const reconnect = () => {
    if (connectionAttempts.value >= maxReconnectionAttempts.value) {
      console.error('Máximo número de intentos de reconexión alcanzado')
      appStore.addRealTimeNotification({
        type: 'error',
        title: 'Error de Conexión',
        message: 'No se pudo restablecer la conexión después de varios intentos'
      })
      return
    }

    connectionAttempts.value++
    reconnecting.value = true
    appStore.setWsReconnecting(true)

    console.log(`Intento de reconexión ${connectionAttempts.value}/${maxReconnectionAttempts.value}`)

    setTimeout(() => {
      if (socket.value) {
        socket.value.connect()
      } else {
        connect()
      }
    }, reconnectionDelay.value * connectionAttempts.value)
  }

  const joinRoom = (roomName) => {
    if (!socket.value || !connected.value) {
      console.warn('WebSocket no está conectado')
      return
    }

    socket.value.emit('join_room', { room: roomName })
    
    // Agregar a la lista de salas
    if (!rooms.value.find(room => room.name === roomName)) {
      rooms.value.push({
        name: roomName,
        active: true,
        joinedAt: new Date()
      })
    }
  }

  const leaveRoom = (roomName) => {
    if (!socket.value || !connected.value) {
      console.warn('WebSocket no está conectado')
      return
    }

    socket.value.emit('leave_room', { room: roomName })
    
    // Remover de la lista de salas
    const roomIndex = rooms.value.findIndex(room => room.name === roomName)
    if (roomIndex > -1) {
      rooms.value.splice(roomIndex, 1)
    }
  }

  const sendMessage = (message) => {
    if (!socket.value || !connected.value) {
      console.warn('WebSocket no está conectado')
      return false
    }

    try {
      socket.value.emit('message', message)
      return true
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      return false
    }
  }

  const sendTyping = (roomName, isTyping = true) => {
    if (!socket.value || !connected.value) {
      return
    }

    socket.value.emit('typing', {
      room: roomName,
      typing: isTyping
    })
  }

  const requestData = (type, params = {}) => {
    if (!socket.value || !connected.value) {
      console.warn('WebSocket no está conectado')
      return false
    }

    try {
      socket.value.emit('request_data', {
        type,
        params,
        timestamp: Date.now()
      })
      return true
    } catch (error) {
      console.error('Error al solicitar datos:', error)
      return false
    }
  }

  const addMessage = (message) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      ...message,
      timestamp: new Date(),
      read: false
    }
    
    messages.value.unshift(newMessage)
    
    // Limitar mensajes
    if (messages.value.length > 100) {
      messages.value = messages.value.slice(0, 100)
    }

    // Agregar al store de la aplicación
    appStore.addWsMessage(newMessage)
  }

  const markMessageAsRead = (messageId) => {
    const message = messages.value.find(msg => msg.id === messageId)
    if (message) {
      message.read = true
    }
  }

  const clearMessages = () => {
    messages.value = []
    appStore.clearWsMessages()
  }

  const setTypingUser = (roomName, userId, isTyping) => {
    if (!typingUsers.value[roomName]) {
      typingUsers.value[roomName] = []
    }

    if (isTyping) {
      if (!typingUsers.value[roomName].includes(userId)) {
        typingUsers.value[roomName].push(userId)
      }
    } else {
      const index = typingUsers.value[roomName].indexOf(userId)
      if (index > -1) {
        typingUsers.value[roomName].splice(index, 1)
      }
    }
  }

  const clearTypingUsers = (roomName) => {
    if (typingUsers.value[roomName]) {
      typingUsers.value[roomName] = []
    }
  }

  // Configurar event listeners
  const setupEventListeners = () => {
    if (!socket.value) return

    // Conexión
    socket.value.on('connect', () => {
      console.log('WebSocket conectado')
      connected.value = true
      reconnecting.value = false
      connectionAttempts.value = 0
      appStore.setWsConnected(true)
      appStore.setWsReconnecting(false)

      // Unirse a salas por defecto
      joinRoom('admin')
      joinRoom('notifications')
      joinRoom('system')

      toast.success('Conexión en tiempo real establecida')
    })

    // Desconexión
    socket.value.on('disconnect', (reason) => {
      console.log('WebSocket desconectado:', reason)
      connected.value = false
      appStore.setWsConnected(false)

      if (reason === 'io server disconnect') {
        // Desconexión iniciada por el servidor
        toast.warning('Conexión cerrada por el servidor')
      } else if (reason === 'io client disconnect') {
        // Desconexión iniciada por el cliente
        console.log('Desconexión iniciada por el cliente')
      } else {
        // Desconexión inesperada
        toast.error('Conexión perdida. Intentando reconectar...')
        reconnect()
      }
    })

    // Reconexión
    socket.value.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconectado después de', attemptNumber, 'intentos')
      connected.value = true
      reconnecting.value = false
      connectionAttempts.value = 0
      appStore.setWsConnected(true)
      appStore.setWsReconnecting(false)

      toast.success('Conexión restablecida')
    })

    // Error de reconexión
    socket.value.on('reconnect_failed', () => {
      console.error('Falló la reconexión del WebSocket')
      reconnecting.value = false
      appStore.setWsReconnecting(false)

      toast.error('No se pudo restablecer la conexión')
    })

    // Mensajes
    socket.value.on('message', (data) => {
      console.log('Mensaje recibido:', data)
      addMessage(data)
    })

    // Notificaciones
    socket.value.on('notification', (data) => {
      console.log('Notificación recibida:', data)
      appStore.addRealTimeNotification({
        type: data.type || 'info',
        title: data.title || 'Notificación',
        message: data.message
      })
    })

    // Actualizaciones de datos
    socket.value.on('data_update', (data) => {
      console.log('Actualización de datos recibida:', data)
      
      // Emitir evento personalizado para que los componentes puedan escuchar
      window.dispatchEvent(new CustomEvent('ws-data-update', { detail: data }))
    })

    // Usuario escribiendo
    socket.value.on('user_typing', (data) => {
      setTypingUser(data.room, data.userId, data.typing)
    })

    // Confirmación de sala
    socket.value.on('room_joined', (data) => {
      console.log('Unido a sala:', data.room)
    })

    socket.value.on('room_left', (data) => {
      console.log('Salido de sala:', data.room)
    })

    // Errores
    socket.value.on('error', (error) => {
      console.error('Error de WebSocket:', error)
      appStore.addRealTimeNotification({
        type: 'error',
        title: 'Error de Conexión',
        message: error.message || 'Error en la conexión en tiempo real'
      })
    })

    // Autenticación
    socket.value.on('auth_error', (error) => {
      console.error('Error de autenticación WebSocket:', error)
      toast.error('Error de autenticación en la conexión en tiempo real')
      
      // Intentar renovar token
      authStore.refreshToken().then(() => {
        // Reconectar con nuevo token
        disconnect()
        setTimeout(() => connect(), 1000)
      }).catch(() => {
        // Si no se puede renovar, hacer logout
        authStore.logout(false)
      })
    })
  }

  // Limpiar event listeners
  const cleanupEventListeners = () => {
    if (socket.value) {
      socket.value.off('connect')
      socket.value.off('disconnect')
      socket.value.off('reconnect')
      socket.value.off('reconnect_failed')
      socket.value.off('message')
      socket.value.off('notification')
      socket.value.off('data_update')
      socket.value.off('user_typing')
      socket.value.off('room_joined')
      socket.value.off('room_left')
      socket.value.off('error')
      socket.value.off('auth_error')
    }
  }

  return {
    // Estado
    socket,
    connected,
    reconnecting,
    connectionAttempts,
    maxReconnectionAttempts,
    reconnectionDelay,
    messages,
    rooms,
    typingUsers,

    // Getters
    isConnected,
    isReconnecting,
    connectionStatus,
    messageCount,
    unreadMessageCount,
    activeRooms,

    // Acciones
    connect,
    disconnect,
    reconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    requestData,
    addMessage,
    markMessageAsRead,
    clearMessages,
    setTypingUser,
    clearTypingUsers,
    setupEventListeners,
    cleanupEventListeners
  }
}) 