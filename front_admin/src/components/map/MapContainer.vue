<template>
  <div class="map-container">
    <!-- Contenedor del mapa -->
    <div 
      ref="mapContainer" 
      class="map-wrapper"
      :class="{ 'loading': !isMapReady }"
    ></div>

    <!-- Loading overlay -->
    <div v-if="!isMapReady" class="map-loading">
      <div class="loading-spinner"></div>
      <p>Cargando mapa...</p>
    </div>

    <!-- Controles del mapa -->
    <div class="map-controls">
      <button 
        @click="fitBounds"
        class="control-btn"
        title="Ajustar vista a todos los marcadores"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
        </svg>
      </button>

      <button 
        @click="centerMap(defaultCenter)"
        class="control-btn"
        title="Centrar mapa"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      </button>
    </div>

    <!-- Información del mapa -->
    <div class="map-info">
      <div class="info-item">
        <span class="info-label">Zoom:</span>
        <span class="info-value">{{ currentZoom }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Centro:</span>
        <span class="info-value">{{ currentCenter.lat.toFixed(4) }}, {{ currentCenter.lng.toFixed(4) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useMap } from '@/composables/useMap'

// Props
const props = defineProps({
  center: {
    type: Array,
    default: () => [
      import.meta.env.VITE_MAP_CENTER_LAT || -34.6037,
      import.meta.env.VITE_MAP_CENTER_LNG || -58.3816
    ]
  },
  zoom: {
    type: Number,
    default: () => import.meta.env.VITE_MAP_ZOOM || 10
  },
  config: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['map-ready', 'map-click', 'map-move', 'map-zoom'])

// Composables
const { 
  map, 
  mapContainer, 
  isMapReady, 
  initMap, 
  centerMap, 
  fitBounds,
  onMapClick,
  onMapMove,
  onMapZoom
} = useMap()

// Refs
const mapContainer = ref(null)
const currentZoom = ref(props.zoom)
const currentCenter = ref({
  lat: props.center[0],
  lng: props.center[1]
})

// Computed
const defaultCenter = computed(() => [props.center[0], props.center[1]])

// Inicializar mapa
const initializeMap = () => {
  if (!mapContainer.value) return

  const mapInstance = initMap(mapContainer.value, {
    center: props.center,
    zoom: props.zoom,
    ...props.config
  })

  if (mapInstance) {
    // Configurar eventos
    onMapClick((e) => {
      emit('map-click', e)
    })

    onMapMove(() => {
      if (map.value) {
        const center = map.value.getCenter()
        currentCenter.value = {
          lat: center.lat,
          lng: center.lng
        }
        emit('map-move', center)
      }
    })

    onMapZoom(() => {
      if (map.value) {
        currentZoom.value = map.value.getZoom()
        emit('map-zoom', currentZoom.value)
      }
    })

    // Emitir evento de mapa listo
    emit('map-ready', mapInstance)
  }
}

// Lifecycle
onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  // Cleanup se maneja en el composable
})
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.map-wrapper {
  width: 100%;
  height: 100%;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  overflow: hidden;
}

.map-wrapper.loading {
  opacity: 0.7;
}

.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  z-index: 1000;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.map-controls {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1000;
}

.control-btn {
  width: 2.5rem;
  height: 2.5rem;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.control-btn:active {
  transform: translateY(0);
}

.map-info {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
  font-size: 0.875rem;
  z-index: 1000;
}

.info-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: #374151;
}

.info-value {
  color: #6b7280;
  font-family: monospace;
}

/* Estilos para marcadores personalizados */
:deep(.custom-marker) {
  background: transparent;
  border: none;
}

:deep(.marker-content) {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #3b82f6;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .map-controls {
    top: 0.5rem;
    right: 0.5rem;
  }

  .control-btn {
    width: 2rem;
    height: 2rem;
  }

  .map-info {
    bottom: 0.5rem;
    left: 0.5rem;
    font-size: 0.75rem;
    padding: 0.375rem;
  }
}
</style> 