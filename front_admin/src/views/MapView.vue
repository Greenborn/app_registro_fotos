<template>
  <Navigation>
    <div>
      <!-- Eliminado el título y subtítulo -->

      <!-- Controles del mapa -->
      <div class="map-filters-overlay">
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
      <div class="bg-white rounded-lg shadow overflow-hidden" style="min-height: 400px; height: 100%; position: relative;">
        <MapContainer
          :center="mapCenter"
          :zoom="mapZoom"
          @map-ready="onMapReady"
        />
      </div>
      <!-- Todo lo que está debajo del mapa ha sido eliminado -->
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

<style scoped>
.map-filters-overlay {
  position: absolute;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1001;
  background: rgba(255,255,255,0.95);
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  border-radius: 0.5rem;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bg-white.rounded-lg.shadow.overflow-hidden {
  position: relative;
  height: 100%;
}
</style> 