<template>
  <div class="operator-marker">
    <!-- El marcador se renderiza automáticamente por Leaflet -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'

// Props
const props = defineProps({
  operator: {
    type: Object,
    required: true
  },
  map: {
    type: Object,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastLocation: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['marker-click'])

// Refs
const marker = ref(null)
const popup = ref(null)

// Colores para diferentes estados
const getMarkerColor = (isOnline) => {
  return isOnline ? '#10b981' : '#6b7280'
}

// Crear icono personalizado
const createIcon = (isOnline) => {
  const color = getMarkerColor(isOnline)
  
  return L.divIcon({
    className: 'operator-marker-icon',
    html: `
      <div class="marker-content" style="background-color: ${color};">
        <div class="marker-pulse ${isOnline ? 'online' : ''}"></div>
        <div class="marker-dot"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  })
}

// Crear popup
const createPopup = () => {
  const operator = props.operator
  const location = props.lastLocation
  
  const content = `
    <div class="operator-popup">
      <div class="popup-header">
        <h3 class="popup-title">${operator.name || operator.username}</h3>
        <span class="popup-status ${props.isOnline ? 'online' : 'offline'}">
          ${props.isOnline ? 'En línea' : 'Desconectado'}
        </span>
      </div>
      
      <div class="popup-content">
        <div class="popup-info">
          <p><strong>Usuario:</strong> ${operator.username}</p>
          <p><strong>Rol:</strong> ${operator.role === 'operator' ? 'Operador' : 'Administrador'}</p>
          ${location ? `
            <p><strong>Última ubicación:</strong></p>
            <p class="location-coords">${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</p>
            <p><strong>Precisión:</strong> ${location.accuracy ? `${Math.round(location.accuracy)}m` : 'N/A'}</p>
          ` : '<p><strong>Ubicación:</strong> No disponible</p>'}
        </div>
        
        <div class="popup-actions">
          <button class="popup-btn primary" onclick="window.dispatchEvent(new CustomEvent('operator-details', {detail: '${operator.id}'}))">
            Ver detalles
          </button>
          <button class="popup-btn secondary" onclick="window.dispatchEvent(new CustomEvent('operator-photos', {detail: '${operator.id}'}))">
            Ver fotos
          </button>
        </div>
      </div>
    </div>
  `

  return L.popup({
    maxWidth: 300,
    className: 'operator-popup-container'
  }).setContent(content)
}

// Crear marcador
const createMarker = () => {
  if (!props.map || !props.lastLocation) return

  const latlng = [props.lastLocation.lat, props.lastLocation.lng]
  const icon = createIcon(props.isOnline)
  
  marker.value = L.marker(latlng, { icon })
    .addTo(props.map)
    .bindPopup(createPopup())

  // Eventos del marcador
  marker.value.on('click', () => {
    emit('marker-click', {
      operator: props.operator,
      location: props.lastLocation,
      marker: marker.value
    })
  })

  // Eventos del popup
  marker.value.on('popupopen', () => {
    // Escuchar eventos personalizados del popup
    window.addEventListener('operator-details', handleOperatorDetails)
    window.addEventListener('operator-photos', handleOperatorPhotos)
  })

  marker.value.on('popupclose', () => {
    // Limpiar event listeners
    window.removeEventListener('operator-details', handleOperatorDetails)
    window.removeEventListener('operator-photos', handleOperatorPhotos)
  })
}

// Manejadores de eventos del popup
const handleOperatorDetails = (event) => {
  emit('operator-details', event.detail)
}

const handleOperatorPhotos = (event) => {
  emit('operator-photos', event.detail)
}

// Actualizar marcador
const updateMarker = () => {
  if (!marker.value || !props.lastLocation) return

  const latlng = [props.lastLocation.lat, props.lastLocation.lng]
  marker.value.setLatLng(latlng)
  
  // Actualizar icono si cambió el estado
  const currentIcon = marker.value.getIcon()
  const newIcon = createIcon(props.isOnline)
  
  if (currentIcon.options.html !== newIcon.options.html) {
    marker.value.setIcon(newIcon)
  }
}

// Remover marcador
const removeMarker = () => {
  if (marker.value && props.map) {
    props.map.removeLayer(marker.value)
    marker.value = null
  }
}

// Watchers
watch(() => props.lastLocation, (newLocation) => {
  if (newLocation) {
    if (marker.value) {
      updateMarker()
    } else {
      createMarker()
    }
  }
}, { deep: true })

watch(() => props.isOnline, () => {
  if (marker.value) {
    updateMarker()
  }
})

watch(() => props.operator, () => {
  if (marker.value) {
    updateMarker()
  }
})

// Lifecycle
onMounted(() => {
  if (props.lastLocation) {
    createMarker()
  }
})

onUnmounted(() => {
  removeMarker()
  window.removeEventListener('operator-details', handleOperatorDetails)
  window.removeEventListener('operator-photos', handleOperatorPhotos)
})
</script>

<style scoped>
/* Los estilos se aplican globalmente para los marcadores de Leaflet */
</style>

<style>
/* Estilos globales para marcadores de operadores */
.operator-marker-icon {
  background: transparent;
  border: none;
}

.operator-marker-icon .marker-content {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.operator-marker-icon .marker-dot {
  width: 8px;
  height: 8px;
  background-color: white;
  border-radius: 50%;
  z-index: 2;
}

.operator-marker-icon .marker-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: inherit;
  opacity: 0.6;
  animation: none;
}

.operator-marker-icon .marker-pulse.online {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
}

/* Estilos para popups */
.operator-popup-container .leaflet-popup-content-wrapper {
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.operator-popup-container .leaflet-popup-content {
  margin: 0;
  padding: 0;
}

.operator-popup {
  padding: 1rem;
  min-width: 250px;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.popup-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.popup-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.popup-status.online {
  background-color: #dcfce7;
  color: #166534;
}

.popup-status.offline {
  background-color: #f3f4f6;
  color: #6b7280;
}

.popup-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.popup-info p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #374151;
}

.popup-info .location-coords {
  font-family: monospace;
  font-size: 0.75rem;
  color: #6b7280;
  background-color: #f9fafb;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin: 0.25rem 0;
}

.popup-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.popup-btn {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.popup-btn.primary {
  background-color: #3b82f6;
  color: white;
}

.popup-btn.primary:hover {
  background-color: #2563eb;
}

.popup-btn.secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.popup-btn.secondary:hover {
  background-color: #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .operator-popup {
    padding: 0.75rem;
    min-width: 200px;
  }

  .popup-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .popup-actions {
    flex-direction: column;
  }
}
</style> 