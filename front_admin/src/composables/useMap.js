import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export function useMap() {
  const map = ref(null)
  const mapContainer = ref(null)
  const markers = ref(new Map())
  const layers = ref(new Map())
  const isMapReady = ref(false)

  // Configuración por defecto del mapa
  const defaultConfig = {
    center: [
      import.meta.env.VITE_MAP_CENTER_LAT || -34.6037,
      import.meta.env.VITE_MAP_CENTER_LNG || -58.3816
    ],
    zoom: import.meta.env.VITE_MAP_ZOOM || 10,
    tileUrl: import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: import.meta.env.VITE_MAP_ATTRIBUTION || '© OpenStreetMap contributors'
  }

  // Inicializar mapa
  const initMap = (container, config = {}) => {
    if (!container) return

    const mapConfig = { ...defaultConfig, ...config }
    
    map.value = L.map(container).setView(mapConfig.center, mapConfig.zoom)
    
    // Agregar capa de tiles
    L.tileLayer(mapConfig.tileUrl, {
      attribution: mapConfig.attribution,
      maxZoom: 18
    }).addTo(map.value)

    // Configurar controles
    map.value.zoomControl.setPosition('bottomright')
    
    isMapReady.value = true
    
    // Eventos del mapa
    map.value.on('load', () => {
      console.log('Mapa cargado correctamente')
    })

    return map.value
  }

  // Agregar marcador
  const addMarker = (id, latlng, options = {}) => {
    if (!map.value || !isMapReady.value) return null

    const defaultOptions = {
      icon: L.divIcon({
        className: 'custom-marker',
        html: '<div class="marker-content"></div>',
        iconSize: [30, 30]
      }),
      title: 'Marcador'
    }

    const markerOptions = { ...defaultOptions, ...options }
    const marker = L.marker(latlng, markerOptions).addTo(map.value)
    
    markers.value.set(id, marker)
    return marker
  }

  // Actualizar marcador
  const updateMarker = (id, latlng) => {
    const marker = markers.value.get(id)
    if (marker) {
      marker.setLatLng(latlng)
    }
  }

  // Remover marcador
  const removeMarker = (id) => {
    const marker = markers.value.get(id)
    if (marker) {
      map.value.removeLayer(marker)
      markers.value.delete(id)
    }
  }

  // Agregar capa
  const addLayer = (id, layer) => {
    if (!map.value || !isMapReady.value) return

    layer.addTo(map.value)
    layers.value.set(id, layer)
  }

  // Remover capa
  const removeLayer = (id) => {
    const layer = layers.value.get(id)
    if (layer) {
      map.value.removeLayer(layer)
      layers.value.delete(id)
    }
  }

  // Limpiar todos los marcadores
  const clearMarkers = () => {
    markers.value.forEach((marker) => {
      map.value.removeLayer(marker)
    })
    markers.value.clear()
  }

  // Limpiar todas las capas
  const clearLayers = () => {
    layers.value.forEach((layer) => {
      map.value.removeLayer(layer)
    })
    layers.value.clear()
  }

  // Centrar mapa en ubicación
  const centerMap = (latlng, zoom = null) => {
    if (!map.value || !isMapReady.value) return

    if (zoom) {
      map.value.setView(latlng, zoom)
    } else {
      map.value.panTo(latlng)
    }
  }

  // Obtener límites del mapa
  const getBounds = () => {
    if (!map.value || !isMapReady.value) return null
    return map.value.getBounds()
  }

  // Ajustar vista a todos los marcadores
  const fitBounds = () => {
    if (!map.value || !isMapReady.value || markers.value.size === 0) return

    const group = new L.featureGroup(Array.from(markers.value.values()))
    map.value.fitBounds(group.getBounds().pad(0.1))
  }

  // Eventos del mapa
  const onMapClick = (callback) => {
    if (!map.value || !isMapReady.value) return
    map.value.on('click', callback)
  }

  const onMapMove = (callback) => {
    if (!map.value || !isMapReady.value) return
    map.value.on('moveend', callback)
  }

  const onMapZoom = (callback) => {
    if (!map.value || !isMapReady.value) return
    map.value.on('zoomend', callback)
  }

  // Limpiar al desmontar
  onUnmounted(() => {
    if (map.value) {
      map.value.remove()
      map.value = null
    }
    markers.value.clear()
    layers.value.clear()
    isMapReady.value = false
  })

  return {
    map,
    mapContainer,
    markers,
    layers,
    isMapReady,
    initMap,
    addMarker,
    updateMarker,
    removeMarker,
    addLayer,
    removeLayer,
    clearMarkers,
    clearLayers,
    centerMap,
    getBounds,
    fitBounds,
    onMapClick,
    onMapMove,
    onMapZoom
  }
} 