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
import 'ol/ol.css'

const mapContainer = ref(null)
let mapInstance = null

const center = [
  parseFloat(import.meta.env.VITE_MAP_CENTER_LNG) || -58.3816,
  parseFloat(import.meta.env.VITE_MAP_CENTER_LAT) || -34.6037
]
const zoom = parseInt(import.meta.env.VITE_MAP_ZOOM) || 10

onMounted(() => {
  // Transformar coordenadas a proyección Web Mercator
  const fromLonLat = (coords) => window.ol && window.ol.proj ? window.ol.proj.fromLonLat(coords) : [coords[0], coords[1]];
  // OpenLayers usa EPSG:3857, así que transformamos las coords
  mapInstance = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        source: new OSM()
      })
    ],
    view: new View({
      center: window.ol && window.ol.proj ? window.ol.proj.fromLonLat(center) : center,
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