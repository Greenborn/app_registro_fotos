<template>
  <div class="h-screen bg-gray-50 flex flex-col">
    <!-- Barra superior -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo y título -->
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">App Registro Fotos</h1>
            </div>
          </div>

          <!-- Menú superior derecho -->
          <div class="flex items-center space-x-4">
            <!-- Notificaciones -->
            <button class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M9 11h.01M9 8h.01M9 5h.01M9 2h.01" />
              </svg>
            </button>

            <!-- Perfil de usuario -->
            <div class="relative">
              <button @click="toggleUserMenu" class="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">
                    {{ userInitials }}
                  </span>
                </div>
                <span class="text-sm font-medium text-gray-700">{{ userName }}</span>
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Menú desplegable de usuario -->
              <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mi Perfil</a>
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Configuración</a>
                <hr class="my-1">
                <button @click="logout" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex flex-1 h-0">
      <!-- Menú lateral -->
      <aside class="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
        <nav class="mt-5 px-2 h-full">
          <div class="space-y-1">
            <!-- Dashboard -->
            <router-link 
              to="/" 
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/') ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
              Dashboard
            </router-link>

            <!-- Gestión de Usuarios -->
            <router-link 
              to="/users" 
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/users') ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Usuarios
            </router-link>

            <!-- Gestión de Fotos -->
            <router-link 
              to="/photos" 
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/photos') ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Fotos
            </router-link>

            <!-- Mapa -->
            <router-link 
              to="/map" 
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/map') ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
              </svg>
              Mapa
            </router-link>

            <!-- Reportes -->
            <router-link 
              to="/reports" 
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/reports') ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Reportes
            </router-link>

            <!-- Configuración -->
            <router-link 
              to="/settings" 
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/settings') ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configuración
            </router-link>
          </div>
        </nav>
      </aside>

      <!-- Contenido principal -->
      <main class="flex-1 h-full">
        <div class="h-full">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const showUserMenu = ref(false)

// Computed properties
const userName = computed(() => {
  const user = authStore.user
  if (user?.nombre && user?.apellido) {
    return `${user.nombre} ${user.apellido}`
  }
  return user?.username || 'Usuario'
})

const userInitials = computed(() => {
  const user = authStore.user
  if (user?.nombre && user?.apellido) {
    return `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase()
  }
  return user?.username?.charAt(0).toUpperCase() || 'U'
})

// Methods
const isActive = (path) => {
  return route.path === path
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const logout = async () => {
  await authStore.logout()
  showUserMenu.value = false
}

// Cerrar menú al hacer clic fuera
const closeUserMenu = (event) => {
  if (!event.target.closest('.relative')) {
    showUserMenu.value = false
  }
}

// Event listeners
document.addEventListener('click', closeUserMenu)
</script> 