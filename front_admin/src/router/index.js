import { createRouter, createWebHistory } from 'vue-router'

// Vistas básicas
import Dashboard from '@/views/Dashboard.vue'
import Login from '@/views/auth/Login.vue'
import UserManagement from '@/views/UserManagement.vue'

const routes = [
  // Ruta de login
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { 
      title: 'Iniciar Sesión',
      requiresAuth: false 
    }
  },

  // Dashboard principal
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    meta: { 
      title: 'Dashboard',
      requiresAuth: true
    }
  },

  // Gestión de Usuarios
  {
    path: '/users',
    name: 'users',
    component: UserManagement,
    meta: { 
      title: 'Gestión de Usuarios',
      requiresAuth: true
    }
  },

  // Gestión de Fotos
  {
    path: '/photos',
    name: 'photos',
    component: () => import('@/views/PhotoManagement.vue'),
    meta: { 
      title: 'Gestión de Fotos',
      requiresAuth: true
    }
  },

  // Mapa
  {
    path: '/map',
    name: 'map',
    component: () => import('@/views/MapView.vue'),
    meta: { 
      title: 'Mapa',
      requiresAuth: true
    }
  },

  // Reportes
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/views/Reports.vue'),
    meta: { 
      title: 'Reportes',
      requiresAuth: true
    }
  },

  // Configuración
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/Settings.vue'),
    meta: { 
      title: 'Configuración',
      requiresAuth: true
    }
  },

  // Ruta por defecto
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guardia de navegación
router.beforeEach(async (to, from, next) => {
  // Importar el store de autenticación
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()
  
  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    // Si no está autenticado, redirigir al login
    if (!authStore.isAuthenticated) {
      console.log('Redirigiendo al login - no autenticado')
      next('/login')
      return
    }
  }
  
  // Si está en login y ya está autenticado, redirigir al dashboard
  if (to.path === '/login' && authStore.isAuthenticated) {
    console.log('Redirigiendo al dashboard - ya autenticado')
    next('/')
    return
  }
  
  next()
})

export default router 