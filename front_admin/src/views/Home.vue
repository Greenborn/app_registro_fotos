<template>
  <div class="home-view">
    <!-- Header con controles -->
    <div class="controls-header">
      <div class="controls-left">
        <h1 class="page-title">Panel de Control</h1>
        <p class="page-subtitle">Monitoreo en tiempo real de operadores</p>
      </div>
      
      <div class="controls-right">
        <div class="filter-controls">
          <button 
            @click="toggleFilter('operators')"
            :class="['filter-btn', { active: filters.operators }]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
            Operadores ({{ onlineOperators.length }})
          </button>

          <button 
            @click="toggleFilter('photos')"
            :class="['filter-btn', { active: filters.photos }]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Fotos ({{ photos.length }})
          </button>

          <button 
            @click="toggleFilter('routes')"
            :class="['filter-btn', { active: filters.routes }]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"></path>
            </svg>
            Recorridos
          </button>
        </div>

        <div class="operator-filter">
          <select 
            v-model="selectedOperatorId"
            @change="onOperatorChange"
            class="operator-select"
          >
            <option value="">Todos los operadores</option>
            <option 
              v-for="operator in operators" 
              :key="operator.id"
              :value="operator.id"
            >
              {{ operator.name || operator.username }}
            </option>
          </select>
        </div>

        <button 
          @click="resetFilters"
          class="reset-btn"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Resetear
        </button>
      </div>
    </div>

    <!-- Contenedor principal -->
    <div class="main-container">
      <!-- Mapa -->
      <div class="map-section">
        <MapContainer
          ref="mapContainer"
          @map-ready="onMapReady"
          @map-click="onMapClick"
        />
      </div>

      <!-- Panel lateral -->
      <div class="sidebar">
        <!-- Estadísticas -->
        <div class="stats-panel">
          <h3 class="panel-title">Estadísticas</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon bg-blue-100 text-blue-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ operators.length }}</span>
                <span class="stat-label">Operadores</span>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon bg-green-100 text-green-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ onlineOperators.length }}</span>
                <span class="stat-label">En línea</span>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon bg-purple-100 text-purple-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ photos.length }}</span>
                <span class="stat-label">Fotos</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de operadores -->
        <div class="operators-panel">
          <h3 class="panel-title">Operadores Activos</h3>
          <div class="operators-list">
            <div 
              v-for="operator in onlineOperators" 
              :key="operator.id"
              class="operator-item"
              :class="{ selected: selectedOperatorId === operator.id }"
              @click="selectOperator(operator)"
            >
              <div class="operator-avatar">
                <span>{{ operator.name?.[0] || operator.username[0] }}</span>
              </div>
              <div class="operator-info">
                <p class="operator-name">{{ operator.name || operator.username }}</p>
                <p class="operator-status">
                  <span class="status-dot online"></span>
                  En línea
                </p>
              </div>
              <div class="operator-actions">
                <button 
                  @click.stop="viewOperatorDetails(operator)"
                  class="action-btn"
                  title="Ver detalles"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="onlineOperators.length === 0" class="empty-operators">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
              <p>No hay operadores en línea</p>
            </div>
          </div>
        </div>

        <!-- Fotos recientes -->
        <div class="photos-panel">
          <h3 class="panel-title">Fotos Recientes</h3>
          <div class="photos-list">
            <div 
              v-for="photo in recentPhotos" 
              :key="photo.id"
              class="photo-item"
              @click="viewPhotoDetails(photo)"
            >
              <div class="photo-thumbnail">
                <img 
                  :src="getImageUrl(photo)" 
                  :alt="photo.comment || 'Foto'"
                  @error="handleImageError"
                />
              </div>
              <div class="photo-info">
                <p class="photo-operator">{{ photo.operatorName }}</p>
                <p class="photo-date">{{ formatDate(photo.createdAt) }}</p>
              </div>
            </div>

            <div v-if="recentPhotos.length === 0" class="empty-photos">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p>No hay fotos recientes</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <OperatorDetailModal
      v-if="showOperatorModal"
      :operator="selectedOperator"
      @close="showOperatorModal = false"
    />

    <PhotoDetailModal
      v-if="showPhotoModal"
      :photo="selectedPhoto"
      @close="showPhotoModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useOperators } from '@/composables/useOperators'
import { usePhotos } from '@/composables/usePhotos'
import { useMap } from '@/composables/useMap'
import MapContainer from '@/components/map/MapContainer.vue'
import OperatorDetailModal from '@/components/modals/OperatorDetailModal.vue'
import PhotoDetailModal from '@/components/modals/PhotoDetailModal.vue'

// Composables
const { 
  operators,
  loading: operatorsLoading,
  error: operatorsError,
  filteredOperators,
  onlineOperators,
  loadOperators,
  init: initOperators,
  cleanup: cleanupOperators
} = useOperators()

const {
  photos,
  loading: photosLoading,
  error: photosError,
  filteredPhotos,
  loadPhotos,
  getImageUrl,
  formatDate,
  cleanup: cleanupPhotos
} = usePhotos()

const {
  map,
  addMarker,
  updateMarker,
  removeMarker,
  clearMarkers
} = useMap()

// Estado local
const mapContainer = ref(null)
const selectedOperatorId = ref('')
const selectedOperator = ref(null)
const selectedPhoto = ref(null)
const showOperatorModal = ref(false)
const showPhotoModal = ref(false)

// Filtros
const filters = ref({
  operators: true,
  photos: false,
  routes: false
})

// Computed
const recentPhotos = computed(() => {
  return photos.value.slice(0, 5)
})

// Eventos del mapa
const onMapReady = (mapInstance) => {
  console.log('Mapa listo:', mapInstance)
  // Inicializar marcadores de operadores
  updateOperatorMarkers()
}

const onMapClick = (event) => {
  console.log('Click en mapa:', event.latlng)
}

// Filtros
const toggleFilter = (filterType) => {
  filters.value[filterType] = !filters.value[filterType]
  updateMapLayers()
}

const resetFilters = () => {
  filters.value = {
    operators: true,
    photos: false,
    routes: false
  }
  selectedOperatorId.value = ''
  updateMapLayers()
}

const onOperatorChange = () => {
  updateMapLayers()
}

// Operadores
const selectOperator = (operator) => {
  selectedOperatorId.value = operator.id
  updateMapLayers()
}

const viewOperatorDetails = (operator) => {
  selectedOperator.value = operator
  showOperatorModal.value = true
}

// Fotos
const viewPhotoDetails = (photo) => {
  selectedPhoto.value = photo
  showPhotoModal.value = true
}

const handleImageError = (event) => {
  event.target.src = '/placeholder-image.jpg'
}

// Marcadores del mapa
const updateOperatorMarkers = () => {
  if (!map.value) return

  clearMarkers()
  
  onlineOperators.value.forEach(operator => {
    if (operator.lastLocation) {
      addMarker(operator.id, [operator.lastLocation.lat, operator.lastLocation.lng], {
        title: operator.name || operator.username,
        icon: createOperatorIcon(operator)
      })
    }
  })
}

const createOperatorIcon = (operator) => {
  // Implementar creación de icono personalizado
  return null
}

const updateMapLayers = () => {
  // Implementar actualización de capas del mapa según filtros
  console.log('Actualizando capas del mapa:', filters.value)
}

// Lifecycle
onMounted(async () => {
  await initOperators()
  await loadPhotos()
})

onUnmounted(() => {
  cleanupOperators()
  cleanupPhotos()
})
</script>

<style scoped>
.home-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.controls-header {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.controls-left {
  flex: 1;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-controls {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background-color: #e5e7eb;
}

.filter-btn.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.operator-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  min-width: 150px;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background-color: #e5e7eb;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.map-section {
  flex: 1;
  position: relative;
}

.sidebar {
  width: 350px;
  background-color: white;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.stats-panel,
.operators-panel,
.photos-panel {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.operators-list,
.photos-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.operator-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.operator-item:hover {
  background-color: #f9fafb;
}

.operator-item.selected {
  background-color: #dbeafe;
  border: 1px solid #3b82f6;
}

.operator-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.operator-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.operator-name {
  font-weight: 500;
  color: #111827;
  margin: 0;
  font-size: 0.875rem;
}

.operator-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.status-dot.online {
  background-color: #10b981;
}

.operator-actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  width: 1.75rem;
  height: 1.75rem;
  background-color: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #e5e7eb;
  color: #374151;
}

.photo-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.photo-item:hover {
  background-color: #f9fafb;
}

.photo-thumbnail {
  width: 3rem;
  height: 3rem;
  border-radius: 0.375rem;
  overflow: hidden;
  flex-shrink: 0;
}

.photo-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.photo-operator {
  font-weight: 500;
  color: #111827;
  margin: 0;
  font-size: 0.875rem;
}

.photo-date {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.empty-operators,
.empty-photos {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #6b7280;
  text-align: center;
}

.empty-operators p,
.empty-photos p {
  margin: 0;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .controls-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .controls-right {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-controls {
    justify-content: center;
  }

  .main-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: 300px;
  }
}
</style> 