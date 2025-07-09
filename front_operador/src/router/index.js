import { createRouter, createWebHistory } from 'vue-router'

// Vistas principales
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import CameraView from '../views/CameraView.vue'
import GalleryView from '../views/GalleryView.vue'
import MapView from '../views/MapView.vue'
import ProfileView from '../views/ProfileView.vue'
import PhotoDetailView from '../views/PhotoDetailView.vue'
import SettingsView from '../views/SettingsView.vue'
import UnauthorizedView from '../views/UnauthorizedView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'Iniciar Sesión',
      requiresAuth: false,
      transition: 'fade'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      title: 'Registrarse',
      requiresAuth: false,
      transition: 'fade'
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      title: 'Dashboard',
      requiresAuth: true,
      permissions: ['operador'],
      transition: 'slide'
    }
  },
  {
    path: '/camera',
    name: 'camera',
    component: CameraView,
    meta: {
      title: 'Cámara',
      requiresAuth: true,
      permissions: ['operador'],
      transition: 'fade',
      fullscreen: true
    }
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: GalleryView,
    meta: {
      title: 'Galería',
      requiresAuth: true,
      permissions: ['operador'],
      transition: 'slide'
    }
  },
  {
    path: '/gallery/:id',
    name: 'photo-detail',
    component: PhotoDetailView,
    meta: {
      title: 'Detalle de Foto',
      requiresAuth: true,
      permissions: ['operador'],
      transition: 'slide'
    }
  },
  {
    path: '/map',
    name: 'map',
    component: MapView,
    meta: {
      title: 'Mapa',
      requiresAuth: true,
      permissions: ['operador'],
      transition: 'slide'
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: {
      title: 'Perfil',
      requiresAuth: true,
      permissions: ['operador'],
      transition: 'slide'
    }
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: {
      title: 'Configuración',
      requiresAuth: true,
      permissions: ['operador'],
      transition: 'slide'
    }
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: UnauthorizedView,
    meta: {
      title: 'No Autorizado',
      requiresAuth: false,
      transition: 'fade'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      title: 'Página No Encontrada',
      requiresAuth: false,
      transition: 'fade'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Comportamiento de scroll específico para móviles
    if (savedPosition) {
      return savedPosition
    } else {
      // Para rutas con fullscreen, no hacer scroll
      if (to.meta.fullscreen) {
        return { top: 0 }
      }
      // Para otras rutas, scroll suave al top
      return { 
        top: 0,
        behavior: 'smooth'
      }
    }
  }
})

// Guardia de navegación específico para móviles
router.beforeEach(async (to, from, next) => {
  // Verificar si es la primera carga
  const isFirstLoad = !from.name
  
  // Si es la primera carga y no hay token, redirigir al login
  if (isFirstLoad && !localStorage.getItem('accessToken')) {
    if (to.name !== 'login' && to.name !== 'register') {
      next({ name: 'login' })
      return
    }
  }
  
  // Para rutas que requieren autenticación
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('accessToken')
    
    if (!token) {
      next({ 
        name: 'login', 
        query: { redirect: to.fullPath } 
      })
      return
    }
    
    // Verificar permisos si se especifican
    if (to.meta.permissions && to.meta.permissions.length > 0) {
      const userRole = localStorage.getItem('userRole')
      if (!to.meta.permissions.includes(userRole)) {
        next({ name: 'unauthorized' })
        return
      }
    }
  }
  
  // Para rutas de login/register, si ya está autenticado, redirigir al dashboard
  if ((to.name === 'login' || to.name === 'register') && localStorage.getItem('accessToken')) {
    next({ name: 'dashboard' })
    return
  }
  
  next()
})

// Hook después de la navegación
router.afterEach((to, from) => {
  // Actualizar título de la página
  if (to.meta.title) {
    document.title = `${to.meta.title} - Registro de Fotos`
  }
  
  // Configuraciones específicas para rutas fullscreen
  if (to.meta.fullscreen) {
    document.body.classList.add('fullscreen-mode')
  } else {
    document.body.classList.remove('fullscreen-mode')
  }
  
  // Configurar orientación para rutas específicas
  if (to.name === 'camera') {
    // Forzar orientación portrait para la cámara
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.lock('portrait').catch(() => {
        // Si no se puede bloquear, mostrar mensaje
        console.warn('No se pudo bloquear la orientación')
      })
    }
  } else {
    // Permitir orientación libre para otras rutas
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.unlock()
    }
  }
  
  // Configurar estado de la app según la ruta
  const appStore = useAppStore()
  if (appStore) {
    if (to.name === 'camera') {
      appStore.setAppMode('camera')
    } else if (to.name === 'map') {
      appStore.setAppMode('map')
    } else {
      appStore.setAppMode('normal')
    }
  }
})

export default routes 