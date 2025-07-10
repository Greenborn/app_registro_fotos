<template>
  <Navigation>
    <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Gestión de Fotos</h1>
      <p class="mt-2 text-gray-600">Administra las fotos registradas por los operadores</p>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-64">
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Buscar por operador, ubicación..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div class="w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select 
            v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobado</option>
            <option value="rejected">Rechazado</option>
          </select>
        </div>
        <div class="w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input 
            type="date" 
            v-model="dateFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
      </div>
    </div>

    <!-- Tabla de fotos -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">Fotos Registradas</h3>
          <div class="text-sm text-gray-500">
            {{ filteredPhotosByUI.length }} fotos encontradas
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Foto
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operador
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="photo in filteredPhotosByUI" :key="photo.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span class="text-gray-500 text-xs">Vista previa</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ photo.operator }}</div>
                <div class="text-sm text-gray-500">{{ photo.operatorId }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ photo.location }}</div>
                <div class="text-sm text-gray-500">{{ photo.coordinates }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(photo.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getStatusClass(photo.status)"
                >
                  {{ getStatusText(photo.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3">Ver</button>
                <button class="text-green-600 hover:text-green-900 mr-3">Aprobar</button>
                <button class="text-red-600 hover:text-red-900">Rechazar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Anterior
            </button>
            <button class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Siguiente
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Mostrando <span class="font-medium">1</span> a <span class="font-medium">10</span> de <span class="font-medium">97</span> resultados
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Anterior
                </button>
                <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  3
                </button>
                <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </Navigation>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Navigation from '@/components/common/Navigation.vue'
import { usePhotos } from '@/composables/usePhotos'

// Estado reactivo para filtros
const searchQuery = ref('')
const statusFilter = ref('')
const dateFilter = ref('')

// Usar el composable de fotos
const {
  photos,
  filteredPhotos,
  loading,
  error,
  loadPhotos
} = usePhotos()

// Cargar fotos al montar el componente
onMounted(() => {
  loadPhotos()
})

// Computed para filtrar por los filtros locales
const filteredPhotosByUI = computed(() => {
  return filteredPhotos.value.filter(photo => {
    const matchesSearch = !searchQuery.value || 
      (photo.operator?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      photo.location?.toLowerCase().includes(searchQuery.value.toLowerCase()))
    const matchesStatus = !statusFilter.value || photo.status === statusFilter.value
    const matchesDate = !dateFilter.value || (photo.date || photo.createdAt || '').startsWith(dateFilter.value)
    return matchesSearch && matchesStatus && matchesDate
  })
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'approved':
      return 'Aprobado'
    case 'rejected':
      return 'Rechazado'
    default:
      return 'Desconocido'
  }
}
</script> 