import { createRouter, createWebHistory } from 'vue-router'

// Layouts
import AdminLayout from '@/layouts/AdminLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

// Vistas de autenticación
import Login from '@/views/auth/Login.vue'
import ForgotPassword from '@/views/auth/ForgotPassword.vue'
import ResetPassword from '@/views/auth/ResetPassword.vue'

// Vistas principales
import Dashboard from '@/views/Dashboard.vue'
import Unauthorized from '@/views/Unauthorized.vue'
import NotFound from '@/views/NotFound.vue'

// Vistas de gestión de fotos
import PhotosList from '@/views/photos/PhotosList.vue'
import PhotoDetail from '@/views/photos/PhotoDetail.vue'
import PhotoUpload from '@/views/photos/PhotoUpload.vue'
import PhotoEdit from '@/views/photos/PhotoEdit.vue'

// Vistas de gestión de usuarios
import UsersList from '@/views/users/UsersList.vue'
import UserDetail from '@/views/users/UserDetail.vue'
import UserCreate from '@/views/users/UserCreate.vue'
import UserEdit from '@/views/users/UserEdit.vue'

// Vistas de gestión de ubicaciones
import LocationsList from '@/views/locations/LocationsList.vue'
import LocationDetail from '@/views/locations/LocationDetail.vue'
import LocationCreate from '@/views/locations/LocationCreate.vue'
import LocationEdit from '@/views/locations/LocationEdit.vue'

// Vistas de reportes y analytics
import Reports from '@/views/reports/Reports.vue'
import Analytics from '@/views/reports/Analytics.vue'
import ExportData from '@/views/reports/ExportData.vue'

// Vistas de configuración
import Settings from '@/views/settings/Settings.vue'
import Profile from '@/views/settings/Profile.vue'
import SystemConfig from '@/views/settings/SystemConfig.vue'

// Vistas de logs y auditoría
import AuditLogs from '@/views/logs/AuditLogs.vue'
import SystemLogs from '@/views/logs/SystemLogs.vue'

const routes = [
  // Rutas de autenticación
  {
    path: '/auth',
    component: AuthLayout,
    meta: { requiresAuth: false },
    children: [
      {
        path: 'login',
        name: 'login',
        component: Login,
        meta: { 
          title: 'Iniciar Sesión',
          requiresAuth: false 
        }
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: ForgotPassword,
        meta: { 
          title: 'Recuperar Contraseña',
          requiresAuth: false 
        }
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: ResetPassword,
        meta: { 
          title: 'Restablecer Contraseña',
          requiresAuth: false 
        }
      }
    ]
  },

  // Rutas principales con layout de administrador
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      // Dashboard
      {
        path: '',
        name: 'dashboard',
        component: Dashboard,
        meta: { 
          title: 'Dashboard',
          requiresAuth: true,
          permissions: ['dashboard:view']
        }
      },

      // Gestión de fotos
      {
        path: 'photos',
        name: 'photos',
        component: PhotosList,
        meta: { 
          title: 'Gestión de Fotos',
          requiresAuth: true,
          permissions: ['photos:view']
        }
      },
      {
        path: 'photos/upload',
        name: 'photo-upload',
        component: PhotoUpload,
        meta: { 
          title: 'Subir Foto',
          requiresAuth: true,
          permissions: ['photos:create']
        }
      },
      {
        path: 'photos/:id',
        name: 'photo-detail',
        component: PhotoDetail,
        meta: { 
          title: 'Detalle de Foto',
          requiresAuth: true,
          permissions: ['photos:view']
        }
      },
      {
        path: 'photos/:id/edit',
        name: 'photo-edit',
        component: PhotoEdit,
        meta: { 
          title: 'Editar Foto',
          requiresAuth: true,
          permissions: ['photos:update']
        }
      },

      // Gestión de usuarios
      {
        path: 'users',
        name: 'users',
        component: UsersList,
        meta: { 
          title: 'Gestión de Usuarios',
          requiresAuth: true,
          permissions: ['users:view']
        }
      },
      {
        path: 'users/create',
        name: 'user-create',
        component: UserCreate,
        meta: { 
          title: 'Crear Usuario',
          requiresAuth: true,
          permissions: ['users:create']
        }
      },
      {
        path: 'users/:id',
        name: 'user-detail',
        component: UserDetail,
        meta: { 
          title: 'Detalle de Usuario',
          requiresAuth: true,
          permissions: ['users:view']
        }
      },
      {
        path: 'users/:id/edit',
        name: 'user-edit',
        component: UserEdit,
        meta: { 
          title: 'Editar Usuario',
          requiresAuth: true,
          permissions: ['users:update']
        }
      },

      // Gestión de ubicaciones
      {
        path: 'locations',
        name: 'locations',
        component: LocationsList,
        meta: { 
          title: 'Gestión de Ubicaciones',
          requiresAuth: true,
          permissions: ['locations:view']
        }
      },
      {
        path: 'locations/create',
        name: 'location-create',
        component: LocationCreate,
        meta: { 
          title: 'Crear Ubicación',
          requiresAuth: true,
          permissions: ['locations:create']
        }
      },
      {
        path: 'locations/:id',
        name: 'location-detail',
        component: LocationDetail,
        meta: { 
          title: 'Detalle de Ubicación',
          requiresAuth: true,
          permissions: ['locations:view']
        }
      },
      {
        path: 'locations/:id/edit',
        name: 'location-edit',
        component: LocationEdit,
        meta: { 
          title: 'Editar Ubicación',
          requiresAuth: true,
          permissions: ['locations:update']
        }
      },

      // Reportes y analytics
      {
        path: 'reports',
        name: 'reports',
        component: Reports,
        meta: { 
          title: 'Reportes',
          requiresAuth: true,
          permissions: ['reports:view']
        }
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: Analytics,
        meta: { 
          title: 'Analytics',
          requiresAuth: true,
          permissions: ['analytics:view']
        }
      },
      {
        path: 'export',
        name: 'export-data',
        component: ExportData,
        meta: { 
          title: 'Exportar Datos',
          requiresAuth: true,
          permissions: ['data:export']
        }
      },

      // Configuración
      {
        path: 'settings',
        name: 'settings',
        component: Settings,
        meta: { 
          title: 'Configuración',
          requiresAuth: true,
          permissions: ['settings:view']
        }
      },
      {
        path: 'profile',
        name: 'profile',
        component: Profile,
        meta: { 
          title: 'Mi Perfil',
          requiresAuth: true
        }
      },
      {
        path: 'system-config',
        name: 'system-config',
        component: SystemConfig,
        meta: { 
          title: 'Configuración del Sistema',
          requiresAuth: true,
          permissions: ['system:config']
        }
      },

      // Logs y auditoría
      {
        path: 'audit-logs',
        name: 'audit-logs',
        component: AuditLogs,
        meta: { 
          title: 'Logs de Auditoría',
          requiresAuth: true,
          permissions: ['audit:view']
        }
      },
      {
        path: 'system-logs',
        name: 'system-logs',
        component: SystemLogs,
        meta: { 
          title: 'Logs del Sistema',
          requiresAuth: true,
          permissions: ['system:logs']
        }
      }
    ]
  },

  // Rutas de error
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: Unauthorized,
    meta: { 
      title: 'No Autorizado',
      requiresAuth: false 
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
    meta: { 
      title: 'Página No Encontrada',
      requiresAuth: false 
    }
  }
]

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

export default routes 