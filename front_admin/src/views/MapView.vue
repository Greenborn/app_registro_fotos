<template>
  <Navigation>
    <div>
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Mapa de Operadores</h1>
        <p class="mt-2 text-gray-600">Visualiza la ubicación de los operadores en tiempo real</p>
      </div>

      <!-- Controles del mapa -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex items-center space-x-4">
            <label class="flex items-center">
              <input type="checkbox" v-model="showOperators" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
              <span class="ml-2 text-sm text-gray-700">Mostrar operadores</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" v-model="showPhotos" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
              <span class="ml-2 text-sm text-gray-700">Mostrar fotos</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" v-model="showRoutes" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
              <span class="ml-2 text-sm text-gray-700">Mostrar rutas</span>
            </label>
          </div>
          <div class="ml-auto">
            <select 
              v-model="selectedZone"
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las zonas</option>
              <option value="norte">Zona Norte</option>
              <option value="sur">Zona Sur</option>
              <option value="este">Zona Este</option>
              <option value="oeste">Zona Oeste</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Mapa OpenStreetMap -->
      <div class="bg-white rounded-lg shadow overflow-hidden mb-6" style="min-height: 400px;">
        <MapContainer
          :center="mapCenter"
          :zoom="mapZoom"
          @map-ready="onMapReady"
        />
      </div>

      <!-- Panel de información -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Operadores activos -->
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">Operadores Activos</h3>
              <p class="text-2xl font-bold text-green-600">{{ onlineOperators.length }}</p>
            </div>
          </div>
        </div>
        <!-- Fotos hoy -->
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">Fotos Hoy</h3>
              <p class="text-2xl font-bold text-blue-600">47</p>
            </div>
          </div>
        </div>
        <!-- Zonas cubiertas -->
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">Zonas Cubiertas</h3>
              <p class="text-2xl font-bold text-purple-600">8/12</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de operadores -->
      <div class="mt-6 bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Operadores en Línea</h3>
        </div>
        <div class="divide-y divide-gray-200">
          <div v-for="operator in onlineOperators" :key="operator.id" class="px-6 py-4 flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-gray-700">{{ operator.initials }}</span>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">{{ operator.name }}</div>
                <div class="text-sm text-gray-500">{{ operator.zone }}</div>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-sm text-gray-500">
                Última actividad: {{ operator.lastActivity }}
              </div>
              <div class="flex items-center">
                <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span class="text-sm text-green-600">En línea</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Navigation>
</template>

<script setup>
import { ref } from 'vue'
import Navigation from '@/components/common/Navigation.vue'
import MapContainer from '@/components/map/MapContainer.vue'
import { useMap } from '@/composables/useMap'

const showOperators = ref(true)
const showPhotos = ref(true)
const showRoutes = ref(false)
const selectedZone = ref('')

// Centro y zoom desde variables de entorno
const mapCenter = [
  Number(import.meta.env.VITE_MAP_CENTER_LAT) || -34.6037,
  Number(import.meta.env.VITE_MAP_CENTER_LNG) || -58.3816
]
const mapZoom = Number(import.meta.env.VITE_MAP_ZOOM) || 10

// Datos de ejemplo de operadores
const onlineOperators = ref([
  { id: 1, name: 'Juan Pérez', initials: 'JP', zone: 'Zona Norte', lastActivity: 'Hace 2 min', lat: -34.6037, lng: -58.3816 },
  { id: 2, name: 'María García', initials: 'MG', zone: 'Zona Sur', lastActivity: 'Hace 5 min', lat: -34.7, lng: -58.4 },
  { id: 3, name: 'Carlos López', initials: 'CL', zone: 'Zona Este', lastActivity: 'Hace 8 min', lat: -34.5, lng: -58.3 },
  { id: 4, name: 'Ana Rodríguez', initials: 'AR', zone: 'Zona Oeste', lastActivity: 'Hace 12 min', lat: -34.65, lng: -58.5 }
])

// Referencia al mapa
const { addMarker, clearMarkers } = useMap()

// Cuando el mapa está listo, agregar marcadores
const onMapReady = (mapInstance) => {
  clearMarkers()
  if (showOperators.value) {
    onlineOperators.value.forEach(op => {
      if (op.lat && op.lng) {
        addMarker(op.id, [op.lat, op.lng], {
          title: op.name,
          icon: undefined // Aquí puedes personalizar el icono
        })
      }
    })
  }
}
</script> 