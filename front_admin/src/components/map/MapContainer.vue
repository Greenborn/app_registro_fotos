<template>
  <div class="map-container">
    <!-- Contenedor del mapa -->
    <div 
      ref="mapContainer" 
      class="map-wrapper"
    ></div>
    <!-- Puedes mantener los controles y overlays personalizados aquí si lo deseas -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import 'ol/ol.css'

const mapContainer = ref(null)
let mapInstance = null

// Coordenadas de Tandil, Buenos Aires, Argentina
const DEFAULT_CENTER = [-59.1332, -37.3217]
const center = [
  parseFloat(import.meta.env.VITE_MAP_CENTER_LNG) || DEFAULT_CENTER[0],
  parseFloat(import.meta.env.VITE_MAP_CENTER_LAT) || DEFAULT_CENTER[1]
]
const zoom = parseInt(import.meta.env.VITE_MAP_ZOOM) || 13

onMounted(() => {
  mapInstance = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        source: new OSM()
      })
    ],
    view: new View({
      center: fromLonLat(center),
      zoom
    })
  })
})

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.setTarget(null)
    mapInstance = null
  }
})
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 80vh;
  min-height: 400px;
}

.map-wrapper {
  width: 100%;
  height: 100%;
  min-height: 400px;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  overflow: hidden;
}
</style> 