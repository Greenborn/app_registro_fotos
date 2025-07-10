<template>
  <Navigation>
    <div class="h-full">
      <!-- Eliminado el título y subtítulo -->

      <!-- Controles del mapa -->
      <div class="map-filters-overlay">
        <div class="flex flex-wrap gap-4 items-center w-full">
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
          <!-- Botón para abrir el modal de operadores -->
          <div class="ml-auto">
            <button @click="showOperatorModal = true" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow">
              Filtrar operadores
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de filtro de operadores -->
      <OperatorFilterModal
        :show="showOperatorModal"
        :operators="allOperators"
        :selected="selectedOperators"
        @update:selected="val => selectedOperators = val"
        @close="showOperatorModal = false"
      />

      <!-- Mapa OpenStreetMap -->
      <div class="bg-white rounded-lg shadow overflow-hidden h-full" style="min-height: 400px; height: 100%; position: relative;">
        <MapContainer
          :center="mapCenter"
          :zoom="mapZoom"
          @map-ready="onMapReady"
          class="h-full"
        />
      </div>
      <!-- Todo lo que está debajo del mapa ha sido eliminado -->
    </div>
  </Navigation>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Navigation from '@/components/common/Navigation.vue'
import MapContainer from '@/components/map/MapContainer.vue'
import OperatorFilterModal from '@/components/map/OperatorFilterModal.vue'
import { useMap } from '@/composables/useMap'
import api from '@/api'

const showOperators = ref(true)
const showPhotos = ref(true)
const showRoutes = ref(false)

const allOperators = ref([])
const selectedOperators = ref([])

const filteredOperators = computed(() =>
  allOperators.value.filter(op => selectedOperators.value.includes(op.id))
)

const showOperatorModal = ref(false)

// Centro y zoom desde variables de entorno
const mapCenter = [
  Number(import.meta.env.VITE_MAP_CENTER_LAT) || -34.6037,
  Number(import.meta.env.VITE_MAP_CENTER_LNG) || -58.3816
]
const mapZoom = Number(import.meta.env.VITE_MAP_ZOOM) || 10

// Referencia al mapa
const { addMarker, clearMarkers } = useMap()

// Obtener operadores desde el API al montar
onMounted(async () => {
  try {
    const response = await api.get('/users?role=operator')
    // Adaptar según la estructura real de la respuesta
    const users = response.data?.users || response.data?.usuarios || []
    allOperators.value = users
    selectedOperators.value = users.map(op => op.id)
  } catch (e) {
    allOperators.value = []
    selectedOperators.value = []
  }
})

// Cuando el mapa está listo, agregar marcadores
const onMapReady = (mapInstance) => {
  clearMarkers()
  if (showOperators.value) {
    filteredOperators.value.forEach(op => {
      if (op.lat && op.lng) {
        addMarker(op.id, [op.lat, op.lng], {
          title: op.name || op.nombre || op.username,
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