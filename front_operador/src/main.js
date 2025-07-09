import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Importar estilos globales
import './assets/styles/main.css'
import './assets/styles/tailwind.css'

// Importar componentes globales
import App from './App.vue'

// Importar rutas
import routes from './router'

// Importar stores
import { useAuthStore } from './stores/auth'
import { useAppStore } from './stores/app'

// Configuración de Toast para móviles
const toastOptions = {
  position: 'top-center',
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  // Configuraciones específicas para móviles
  maxToasts: 3,
  newestOnTop: true,
  filterBeforeCreate: (toast, toasts) => {
    // Limitar toasts en móviles
    if (toasts.length >= 3) {
      return false
    }
    return toast
  }
}

// Crear instancia de Pinia
const pinia = createPinia()

// Crear router
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Guardia de navegación para autenticación
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const appStore = useAppStore()
  
  // Mostrar loading
  appStore.setLoading(true)
  
  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    // Verificar si el usuario está autenticado
    if (!authStore.isAuthenticated) {
      // Intentar renovar el token
      try {
        await authStore.refreshToken()
      } catch (error) {
        // Si no se puede renovar, redirigir al login
        next({ name: 'login', query: { redirect: to.fullPath } })
        return
      }
    }
    
    // Verificar permisos si la ruta los requiere
    if (to.meta.permissions && to.meta.permissions.length > 0) {
      const hasPermission = authStore.hasAnyPermission(to.meta.permissions)
      if (!hasPermission) {
        next({ name: 'unauthorized' })
        return
      }
    }
  }
  
  // Si la ruta es login y ya está autenticado, redirigir al dashboard
  if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }
  
  next()
})

// Hook después de la navegación
router.afterEach((to, from) => {
  const appStore = useAppStore()
  appStore.setLoading(false)
  
  // Actualizar título de la página
  if (to.meta.title) {
    document.title = `${to.meta.title} - Registro de Fotos`
  } else {
    document.title = 'Registro de Fotos - Operador'
  }
})

// Crear aplicación Vue
const app = createApp(App)

// Usar plugins
app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)

// Configuración global de la aplicación
app.config.globalProperties.$appName = 'Registro de Fotos'
app.config.globalProperties.$appVersion = '1.0.0'

// Manejo global de errores
app.config.errorHandler = (err, vm, info) => {
  console.error('Error global:', err)
  console.error('Componente:', vm)
  console.error('Info:', info)
  
  // Mostrar notificación de error
  const { toast } = require('vue-toastification')
  toast.error('Ha ocurrido un error inesperado. Por favor, inténtelo de nuevo.')
}

// Manejo de advertencias en desarrollo
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, vm, trace) => {
    console.warn('Advertencia Vue:', msg)
    console.warn('Componente:', vm)
    console.warn('Trace:', trace)
  }
}

// Configuraciones específicas para móviles
const setupMobileConfig = () => {
  // Prevenir zoom en dispositivos móviles
  let lastTouchEnd = 0
  document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }, false)

  // Prevenir scroll en el body cuando hay modales
  const preventScroll = (e) => {
    e.preventDefault()
  }

  // Agregar listener para prevenir scroll en modales
  document.addEventListener('touchmove', preventScroll, { passive: false })
  
  // Remover listener cuando no hay modales
  const removePreventScroll = () => {
    document.removeEventListener('touchmove', preventScroll)
  }

  // Exponer función para remover prevent scroll
  window.removePreventScroll = removePreventScroll
}

// Configurar PWA
const setupPWA = () => {
  // Verificar si el navegador soporta service workers
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registrado: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registro falló: ', registrationError)
        })
    })
  }

  // Detectar si la app está instalada como PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                window.navigator.standalone === true

  if (isPWA) {
    document.body.classList.add('pwa-mode')
  }
}

// Configurar geolocalización
const setupGeolocation = () => {
  // Solicitar permisos de geolocalización al cargar
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Geolocalización obtenida:', position)
        // Guardar en localStorage para uso posterior
        localStorage.setItem('lastKnownLocation', JSON.stringify({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        }))
      },
      (error) => {
        console.warn('Error al obtener geolocalización:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }
}

// Configurar cámara
const setupCamera = () => {
  // Verificar si el navegador soporta getUserMedia
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log('Cámara disponible')
  } else {
    console.warn('Cámara no disponible en este dispositivo')
  }
}

// Configurar orientación de pantalla
const setupOrientation = () => {
  // Detectar orientación de pantalla
  const handleOrientation = () => {
    const orientation = window.orientation
    document.body.setAttribute('data-orientation', orientation === 0 ? 'portrait' : 'landscape')
  }

  window.addEventListener('orientationchange', handleOrientation)
  handleOrientation() // Ejecutar una vez al inicio
}

// Configurar eventos de visibilidad
const setupVisibility = () => {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // App en segundo plano
      console.log('App en segundo plano')
    } else {
      // App en primer plano
      console.log('App en primer plano')
      // Renovar geolocalización si es necesario
      setupGeolocation()
    }
  })
}

// Inicializar configuraciones móviles
setupMobileConfig()
setupPWA()
setupGeolocation()
setupCamera()
setupOrientation()
setupVisibility()

// Montar aplicación
app.mount('#app')

// Exportar para uso en otros archivos
export { app, router, pinia } 