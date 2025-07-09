<template>
  <div id="app" class="app-container">
    <!-- Indicador de carga global -->
    <div v-if="appStore.loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-text">{{ appStore.loadingMessage || 'Cargando...' }}</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="app-content" :class="{ 'loading': appStore.loading }">
      <!-- Header móvil -->
      <header v-if="showHeader" class="mobile-header">
        <div class="header-content">
          <div class="header-left">
            <button 
              v-if="showBackButton" 
              @click="goBack" 
              class="back-button"
              aria-label="Volver"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h1 v-if="pageTitle" class="page-title">{{ pageTitle }}</h1>
          </div>
          <div class="header-right">
            <slot name="header-actions"></slot>
          </div>
        </div>
      </header>

      <!-- Contenido de la página -->
      <main class="main-content" :class="{ 'with-header': showHeader }">
        <router-view v-slot="{ Component, route }">
          <transition 
            :name="transitionName" 
            mode="out-in"
            @before-enter="beforeEnter"
            @enter="enter"
            @leave="leave"
          >
            <component 
              :is="Component" 
              :key="route.fullPath"
              class="page-component"
            />
          </transition>
        </router-view>
      </main>

      <!-- Footer móvil -->
      <footer v-if="showFooter" class="mobile-footer">
        <slot name="footer-content"></slot>
      </footer>

      <!-- Barra de navegación inferior -->
      <nav v-if="showBottomNav" class="bottom-navigation">
        <router-link 
          v-for="item in navigationItems" 
          :key="item.name"
          :to="item.path" 
          class="nav-item"
          :class="{ 'active': $route.name === item.name }"
          :aria-label="item.label"
        >
          <div class="nav-icon">
            <component :is="item.icon" />
          </div>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>
    </div>

    <!-- Notificaciones toast -->
    <div class="toast-container"></div>

    <!-- Modal de confirmación -->
    <div v-if="appStore.confirmation.show" class="modal-overlay" @click="closeConfirmation">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ appStore.confirmation.title }}</h3>
          <button @click="closeConfirmation" class="modal-close" aria-label="Cerrar">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ appStore.confirmation.message }}</p>
        </div>
        <div class="modal-footer">
          <button 
            @click="closeConfirmation" 
            class="btn btn-secondary"
          >
            {{ appStore.confirmation.cancelText || 'Cancelar' }}
          </button>
          <button 
            @click="confirmAction" 
            class="btn btn-primary"
            :class="{ 'loading': appStore.confirmation.loading }"
          >
            <span v-if="appStore.confirmation.loading" class="spinner-small"></span>
            {{ appStore.confirmation.confirmText || 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Indicador de estado de conexión -->
    <div v-if="!appStore.isOnline" class="offline-indicator">
      <div class="offline-content">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"></path>
        </svg>
        <span>Sin conexión</span>
      </div>
    </div>

    <!-- Indicador de GPS -->
    <div v-if="showGpsIndicator" class="gps-indicator" :class="{ 'active': gpsActive }">
      <div class="gps-content">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <span>{{ gpsActive ? 'GPS Activo' : 'GPS Inactivo' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useAppStore } from './stores/app'
import { useWebSocketStore } from './stores/websocket'

// Iconos de navegación
import CameraIcon from './components/icons/CameraIcon.vue'
import GalleryIcon from './components/icons/GalleryIcon.vue'
import MapIcon from './components/icons/MapIcon.vue'
import ProfileIcon from './components/icons/ProfileIcon.vue'

export default {
  name: 'App',
  components: {
    CameraIcon,
    GalleryIcon,
    MapIcon,
    ProfileIcon
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const appStore = useAppStore()
    const websocketStore = useWebSocketStore()

    // Items de navegación
    const navigationItems = [
      {
        name: 'camera',
        path: '/camera',
        label: 'Cámara',
        icon: CameraIcon
      },
      {
        name: 'gallery',
        path: '/gallery',
        label: 'Galería',
        icon: GalleryIcon
      },
      {
        name: 'map',
        path: '/map',
        label: 'Mapa',
        icon: MapIcon
      },
      {
        name: 'profile',
        path: '/profile',
        label: 'Perfil',
        icon: ProfileIcon
      }
    ]

    // Computed properties
    const showHeader = computed(() => {
      return !['login', 'register', 'camera'].includes(route.name)
    })

    const showFooter = computed(() => {
      return false // No mostramos footer en móviles
    })

    const showBottomNav = computed(() => {
      return authStore.isAuthenticated && !['login', 'register'].includes(route.name)
    })

    const showBackButton = computed(() => {
      return !['dashboard', 'camera', 'gallery', 'map', 'profile'].includes(route.name)
    })

    const pageTitle = computed(() => {
      return route.meta.title || ''
    })

    const transitionName = computed(() => {
      return route.meta.transition || 'slide'
    })

    const showGpsIndicator = computed(() => {
      return ['camera', 'map'].includes(route.name)
    })

    const gpsActive = computed(() => {
      return appStore.gpsStatus === 'active'
    })

    // Métodos
    const goBack = () => {
      if (window.history.length > 1) {
        router.back()
      } else {
        router.push('/dashboard')
      }
    }

    const closeConfirmation = () => {
      appStore.hideConfirmation()
    }

    const confirmAction = async () => {
      if (appStore.confirmation.onConfirm) {
        await appStore.confirmation.onConfirm()
      }
      appStore.hideConfirmation()
    }

    // Transiciones
    const beforeEnter = (el) => {
      el.style.opacity = '0'
      el.style.transform = 'translateX(20px)'
    }

    const enter = (el, done) => {
      el.style.transition = 'all 0.3s ease'
      el.style.opacity = '1'
      el.style.transform = 'translateX(0)'
      setTimeout(done, 300)
    }

    const leave = (el, done) => {
      el.style.transition = 'all 0.3s ease'
      el.style.opacity = '0'
      el.style.transform = 'translateX(-20px)'
      setTimeout(done, 300)
    }

    // Lifecycle hooks
    onMounted(() => {
      // Configurar eventos de visibilidad
      const handleVisibilityChange = () => {
        if (document.hidden) {
          appStore.setAppState('background')
        } else {
          appStore.setAppState('foreground')
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      // Configurar eventos de conexión
      const handleOnline = () => {
        appStore.setOnlineStatus(true)
        websocketStore.connect()
      }

      const handleOffline = () => {
        appStore.setOnlineStatus(false)
        websocketStore.disconnect()
      }

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      // Configurar eventos de orientación
      const handleOrientationChange = () => {
        appStore.setOrientation(window.orientation === 0 ? 'portrait' : 'landscape')
      }

      window.addEventListener('orientationchange', handleOrientationChange)

      // Limpiar listeners
      onUnmounted(() => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        window.removeEventListener('orientationchange', handleOrientationChange)
      })
    })

    return {
      appStore,
      navigationItems,
      showHeader,
      showFooter,
      showBottomNav,
      showBackButton,
      pageTitle,
      transitionName,
      showGpsIndicator,
      gpsActive,
      goBack,
      closeConfirmation,
      confirmAction,
      beforeEnter,
      enter,
      leave
    }
  }
}
</script>

<style scoped>
.app-container {
  @apply relative w-full h-screen bg-gray-50 overflow-hidden;
  font-family: 'Inter', system-ui, sans-serif;
}

.loading-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.loading-spinner {
  @apply flex flex-col items-center justify-center bg-white rounded-lg p-6 shadow-lg;
}

.spinner {
  @apply w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4;
}

.loading-text {
  @apply text-gray-700 font-medium;
}

.app-content {
  @apply relative w-full h-full flex flex-col;
}

.app-content.loading {
  @apply pointer-events-none;
}

.mobile-header {
  @apply fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40;
  padding-top: env(safe-area-inset-top);
}

.header-content {
  @apply flex items-center justify-between px-4 py-3;
}

.header-left {
  @apply flex items-center space-x-3;
}

.back-button {
  @apply p-2 text-gray-600 hover:text-gray-900 transition-colors;
  min-height: 44px;
  min-width: 44px;
}

.page-title {
  @apply text-lg font-semibold text-gray-900;
}

.header-right {
  @apply flex items-center space-x-2;
}

.main-content {
  @apply flex-1 overflow-hidden;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.main-content.with-header {
  padding-top: calc(env(safe-area-inset-top) + 60px);
}

.page-component {
  @apply w-full h-full;
}

.mobile-footer {
  @apply bg-white border-t border-gray-200 p-4;
}

.bottom-navigation {
  @apply fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center z-40;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  @apply flex flex-col items-center justify-center py-2 px-3 text-gray-600 transition-colors;
  min-height: 60px;
  min-width: 60px;
}

.nav-item.active {
  @apply text-primary-600;
}

.nav-icon {
  @apply w-6 h-6 mb-1;
}

.nav-label {
  @apply text-xs font-medium;
}

.toast-container {
  @apply fixed top-4 left-4 right-4 z-50;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-sm w-full max-h-96 overflow-hidden;
}

.modal-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900;
}

.modal-close {
  @apply p-1 text-gray-400 hover:text-gray-600 transition-colors;
}

.modal-body {
  @apply p-4;
}

.modal-footer {
  @apply flex items-center justify-end space-x-3 p-4 border-t border-gray-200;
}

.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
  min-height: 44px;
}

.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
}

.btn.loading {
  @apply opacity-75 pointer-events-none;
}

.spinner-small {
  @apply w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2;
}

.offline-indicator {
  @apply fixed top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium z-50;
}

.offline-content {
  @apply flex items-center space-x-2;
}

.gps-indicator {
  @apply fixed top-4 left-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium z-50;
  transition: all 0.3s ease;
}

.gps-indicator.active {
  @apply bg-green-500;
}

.gps-content {
  @apply flex items-center space-x-2;
}

/* Transiciones */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .main-content.with-header {
    padding-top: calc(env(safe-area-inset-top) + 56px);
  }
  
  .nav-item {
    min-height: 56px;
    min-width: 56px;
  }
}

/* Orientación landscape */
@media (orientation: landscape) {
  .mobile-header {
    padding-top: env(safe-area-inset-top);
  }
  
  .main-content.with-header {
    padding-top: calc(env(safe-area-inset-top) + 48px);
  }
}

/* PWA mode */
.pwa-mode .mobile-header {
  padding-top: 0;
}

.pwa-mode .main-content.with-header {
  padding-top: 48px;
}
</style> 