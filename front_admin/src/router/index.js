import { createRouter, createWebHistory } from 'vue-router'

// Vistas básicas
import Dashboard from '@/views/Dashboard.vue'
import Login from '@/views/auth/Login.vue'

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

// Guardia de navegación básica
router.beforeEach((to, from, next) => {
  // Por ahora, permitir acceso a todas las rutas
  next()
})

export default router 