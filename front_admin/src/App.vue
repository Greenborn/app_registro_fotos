<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Loading global -->
    <div v-if="appStore.loading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg p-6 shadow-lg">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span class="text-gray-700">Cargando...</span>
        </div>
      </div>
    </div>

    <!-- Router view -->
    <router-view v-slot="{ Component, route }">
      <transition 
        name="page" 
        mode="out-in"
        @before-enter="beforeEnter"
        @enter="enter"
        @leave="leave"
      >
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>

    <!-- Contenedor de notificaciones personalizado -->
    <NotificationContainer position="top-right" />

    <!-- Modal de confirmación global -->
    <ConfirmationModal 
      v-if="appStore.showConfirmation"
      :title="appStore.confirmationTitle"
      :message="appStore.confirmationMessage"
      :confirm-text="appStore.confirmationConfirmText"
      :cancel-text="appStore.confirmationCancelText"
      :type="appStore.confirmationType"
      @confirm="appStore.confirmAction"
      @cancel="appStore.cancelAction"
    />

    <!-- Modal de error global -->
    <ErrorModal 
      v-if="appStore.showError"
      :title="appStore.errorTitle"
      :message="appStore.errorMessage"
      :details="appStore.errorDetails"
      @close="appStore.closeError"
    />

    <!-- Modal de información global -->
    <InfoModal 
      v-if="appStore.showInfo"
      :title="appStore.infoTitle"
      :message="appStore.infoMessage"
      :type="appStore.infoType"
      @close="appStore.closeInfo"
    />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useWebSocketStore } from '@/stores/websocket'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'
import InfoModal from '@/components/modals/InfoModal.vue'
import NotificationContainer from '@/components/common/NotificationContainer.vue'
import Navigation from '@/components/common/Navigation.vue'

// Stores
const appStore = useAppStore()
const authStore = useAuthStore()
const wsStore = useWebSocketStore()

// Transiciones de página
const beforeEnter = (el) => {
  el.style.opacity = '0'
  el.style.transform = 'translateY(20px)'
}

const enter = (el, done) => {
  el.style.transition = 'all 0.3s ease-out'
  el.style.opacity = '1'
  el.style.transform = 'translateY(0)'
  setTimeout(done, 300)
}

const leave = (el) => {
  el.style.transition = 'all 0.2s ease-in'
  el.style.opacity = '0'
  el.style.transform = 'translateY(-20px)'
}

// Lifecycle hooks
onMounted(async () => {
  try {
    // Inicializar la aplicación
    await appStore.initialize()
    
    // Verificar autenticación al cargar
    if (authStore.isAuthenticated) {
      await authStore.refreshToken()
    }
    
    // Conectar WebSocket si está autenticado
    if (authStore.isAuthenticated) {
      wsStore.connect()
    }
    
    // Configurar listeners globales
    setupGlobalListeners()
    
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error)
    appStore.showErrorModal(
      'Error de Inicialización',
      'No se pudo inicializar la aplicación correctamente.',
      error.message
    )
  }
})

onUnmounted(() => {
  // Limpiar listeners
  cleanupGlobalListeners()
  
  // Desconectar WebSocket
  wsStore.disconnect()
})

// Configurar listeners globales
const setupGlobalListeners = () => {
  // Listener para visibilidad de página
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // Listener para antes de cerrar la página
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  // Listener para errores no capturados
  window.addEventListener('error', handleGlobalError)
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
  
  // Listener para teclas de acceso rápido
  document.addEventListener('keydown', handleKeyboardShortcuts)
}

// Limpiar listeners globales
const cleanupGlobalListeners = () => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener('error', handleGlobalError)
  window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  document.removeEventListener('keydown', handleKeyboardShortcuts)
}

// Handlers de eventos globales
const handleVisibilityChange = () => {
  if (document.hidden) {
    // Página oculta
    appStore.setPageHidden(true)
  } else {
    // Página visible
    appStore.setPageHidden(false)
    
    // Renovar token si es necesario
    if (authStore.isAuthenticated) {
      authStore.refreshToken()
    }
  }
}

const handleBeforeUnload = (event) => {
  // Guardar estado antes de cerrar
  appStore.saveState()
  
  // Si hay cambios sin guardar, mostrar confirmación
  if (appStore.hasUnsavedChanges) {
    event.preventDefault()
    event.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?'
  }
}

const handleGlobalError = (event) => {
  console.error('Error global no capturado:', event.error)
  appStore.showErrorModal(
    'Error Inesperado',
    'Ha ocurrido un error inesperado en la aplicación.',
    event.error?.message || 'Error desconocido'
  )
}

const handleUnhandledRejection = (event) => {
  console.error('Promesa rechazada no manejada:', event.reason)
  appStore.showErrorModal(
    'Error de Promesa',
    'Ha ocurrido un error en una operación asíncrona.',
    event.reason?.message || 'Error desconocido'
  )
}

const handleKeyboardShortcuts = (event) => {
  // Ctrl/Cmd + S: Guardar
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    appStore.triggerSave()
  }
  
  // Ctrl/Cmd + N: Nuevo
  if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
    event.preventDefault()
    appStore.triggerNew()
  }
  
  // Ctrl/Cmd + F: Buscar
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault()
    appStore.triggerSearch()
  }
  
  // Escape: Cerrar modales
  if (event.key === 'Escape') {
    appStore.closeAllModals()
  }
}
</script>

<style>
/* Estilos globales */
#app {
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Transiciones de página */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Scrollbar personalizada */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Selección de texto */
::selection {
  background: #3b82f6;
  color: white;
}

/* Focus visible para accesibilidad */
:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Animaciones de carga */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Utilidades de animación */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style> 