import { ref, computed } from 'vue'
import { api } from '@/api'

export function usePhotos() {
  const photos = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedPhoto = ref(null)
  const filters = ref({
    operatorId: null,
    dateFrom: null,
    dateTo: null,
    search: ''
  })

  // Computed properties
  const filteredPhotos = computed(() => {
    let filtered = photos.value

    // Filtrar por operador
    if (filters.value.operatorId) {
      filtered = filtered.filter(photo => 
        photo.operatorId === filters.value.operatorId
      )
    }

    // Filtrar por fecha
    if (filters.value.dateFrom) {
      const fromDate = new Date(filters.value.dateFrom)
      filtered = filtered.filter(photo => 
        new Date(photo.createdAt) >= fromDate
      )
    }

    if (filters.value.dateTo) {
      const toDate = new Date(filters.value.dateTo)
      toDate.setHours(23, 59, 59, 999) // Fin del día
      filtered = filtered.filter(photo => 
        new Date(photo.createdAt) <= toDate
      )
    }

    // Filtrar por búsqueda
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      filtered = filtered.filter(photo => 
        photo.comment?.toLowerCase().includes(searchTerm) ||
        photo.operatorName?.toLowerCase().includes(searchTerm)
      )
    }

    return filtered
  })

  const photosByOperator = computed(() => {
    const grouped = {}
    filteredPhotos.value.forEach(photo => {
      if (!grouped[photo.operatorId]) {
        grouped[photo.operatorId] = []
      }
      grouped[photo.operatorId].push(photo)
    })
    return grouped
  })

  const photosByDate = computed(() => {
    const grouped = {}
    filteredPhotos.value.forEach(photo => {
      const date = new Date(photo.createdAt).toDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(photo)
    })
    return grouped
  })

  // Cargar fotos
  const loadPhotos = async (params = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.get('/photos', { params })
      
      if (response.data.stat) {
        photos.value = response.data.data
      } else {
        throw new Error(response.data.text || 'Error al cargar fotos')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error loading photos:', err)
    } finally {
      loading.value = false
    }
  }

  // Cargar fotos por operador
  const loadPhotosByOperator = async (operatorId) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.get(`/photos/operator/${operatorId}`)
      
      if (response.data.stat) {
        photos.value = response.data.data
      } else {
        throw new Error(response.data.text || 'Error al cargar fotos del operador')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error loading operator photos:', err)
    } finally {
      loading.value = false
    }
  }

  // Obtener foto por ID
  const getPhotoById = async (photoId) => {
    try {
      const response = await api.get(`/photos/${photoId}`)
      
      if (response.data.stat) {
        return response.data.data
      } else {
        throw new Error(response.data.text || 'Error al obtener foto')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error getting photo:', err)
      return null
    }
  }

  // Seleccionar foto
  const selectPhoto = (photo) => {
    selectedPhoto.value = photo
  }

  // Limpiar selección
  const clearSelection = () => {
    selectedPhoto.value = null
  }

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  // Resetear filtros
  const resetFilters = () => {
    filters.value = {
      operatorId: null,
      dateFrom: null,
      dateTo: null,
      search: ''
    }
  }

  // Agregar comentario a foto
  const addComment = async (photoId, comment) => {
    try {
      const response = await api.post(`/photos/${photoId}/comments`, {
        comment
      })
      
      if (response.data.stat) {
        // Actualizar la foto en la lista
        const photoIndex = photos.value.findIndex(p => p.id === photoId)
        if (photoIndex !== -1) {
          photos.value[photoIndex] = response.data.data
        }
        return response.data.data
      } else {
        throw new Error(response.data.text || 'Error al agregar comentario')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error adding comment:', err)
      throw err
    }
  }

  // Eliminar foto
  const deletePhoto = async (photoId) => {
    try {
      const response = await api.delete(`/photos/${photoId}`)
      
      if (response.data.stat) {
        // Remover de la lista
        photos.value = photos.value.filter(p => p.id !== photoId)
        return true
      } else {
        throw new Error(response.data.text || 'Error al eliminar foto')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error deleting photo:', err)
      throw err
    }
  }

  // Obtener estadísticas
  const getStats = async () => {
    try {
      const response = await api.get('/photos/stats')
      
      if (response.data.stat) {
        return response.data.data
      } else {
        throw new Error(response.data.text || 'Error al obtener estadísticas')
      }
    } catch (err) {
      error.value = err.message
      console.error('Error getting stats:', err)
      return null
    }
  }

  // Exportar fotos
  const exportPhotos = async (format = 'json') => {
    try {
      const response = await api.get('/photos/export', {
        params: { format },
        responseType: 'blob'
      })
      
      // Crear descarga
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `photos_export.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error exporting photos:', err)
      throw err
    }
  }

  // Formatear fecha
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Obtener URL de imagen
  const getImageUrl = (photo) => {
    if (photo.imageUrl) {
      return photo.imageUrl
    }
    return `/api/photos/${photo.id}/image`
  }

  // Limpiar
  const cleanup = () => {
    photos.value = []
    selectedPhoto.value = null
    error.value = null
    resetFilters()
  }

  return {
    // State
    photos,
    loading,
    error,
    selectedPhoto,
    filters,
    
    // Computed
    filteredPhotos,
    photosByOperator,
    photosByDate,
    
    // Methods
    loadPhotos,
    loadPhotosByOperator,
    getPhotoById,
    selectPhoto,
    clearSelection,
    updateFilters,
    resetFilters,
    addComment,
    deletePhoto,
    getStats,
    exportPhotos,
    formatDate,
    getImageUrl,
    cleanup
  }
} 