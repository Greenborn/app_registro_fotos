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

// Configuración de Toast
const toastOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
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
    document.title = `${to.meta.title} - Panel de Administración`
  } else {
    document.title = 'Panel de Administración - Registro de Fotos'
  }
})

// Crear aplicación Vue
const app = createApp(App)

// Usar plugins
app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)

// Configuración global de la aplicación
app.config.globalProperties.$appName = 'Panel de Administración'
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

// Montar aplicación
app.mount('#app')

// Exportar para uso en otros archivos
export { app, router, pinia } 