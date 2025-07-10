<template>
  <div class="min-h-screen bg-gray-100">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard de Administración</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Tarjeta de estadísticas -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Total de Fotos</h3>
          <p class="text-3xl font-bold text-blue-600">{{ stats.photos || 0 }}</p>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Total de Usuarios</h3>
          <p class="text-3xl font-bold text-green-600">{{ stats.users || 0 }}</p>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Ubicaciones</h3>
          <p class="text-3xl font-bold text-purple-600">{{ stats.locations || 0 }}</p>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Sesiones Activas</h3>
          <p class="text-3xl font-bold text-orange-600">{{ stats.sessions || 0 }}</p>
        </div>
      </div>
      
      <div class="mt-8 bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Estado del Sistema</h2>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
          <span class="text-green-700 font-medium">Sistema funcionando correctamente</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      stats: {
        photos: 0,
        users: 0,
        locations: 0,
        sessions: 0
      }
    }
  },
  mounted() {
    this.loadStats()
  },
  methods: {
    async loadStats() {
      try {
        // Aquí se cargarían las estadísticas desde el backend
        console.log('Cargando estadísticas...')
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      }
    }
  }
}
</script> 