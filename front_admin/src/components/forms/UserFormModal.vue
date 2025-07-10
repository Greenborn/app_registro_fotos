<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ mode === 'create' ? 'Crear Usuario' : 'Editar Usuario' }}
          </h3>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Nombre de Usuario -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nombre de Usuario *
            </label>
            <input 
              type="text" 
              v-model="form.username"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.username }"
              placeholder="Ingrese nombre de usuario"
            >
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">
              {{ errors.username }}
            </p>
          </div>

          <!-- Nombre Completo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <input 
              type="text" 
              v-model="form.fullName"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.fullName }"
              placeholder="Ingrese nombre completo"
            >
            <p v-if="errors.fullName" class="mt-1 text-sm text-red-600">
              {{ errors.fullName }}
            </p>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input 
              type="email" 
              v-model="form.email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.email }"
              placeholder="Ingrese email"
            >
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
            </p>
          </div>

          <!-- Contraseña (solo para crear) -->
          <div v-if="mode === 'create'">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Contraseña *
            </label>
            <input 
              type="password" 
              v-model="form.password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.password }"
              placeholder="Ingrese contraseña"
            >
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password }}
            </p>
          </div>

          <!-- Confirmar Contraseña (solo para crear) -->
          <div v-if="mode === 'create'">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña *
            </label>
            <input 
              type="password" 
              v-model="form.confirmPassword"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.confirmPassword }"
              placeholder="Confirme la contraseña"
            >
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <!-- Rol -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Rol *
            </label>
            <select 
              v-model="form.role"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.role }"
            >
              <option value="">Seleccione un rol</option>
              <option value="operator">Operador</option>
              <option value="admin">Administrador</option>
            </select>
            <p v-if="errors.role" class="mt-1 text-sm text-red-600">
              {{ errors.role }}
            </p>
          </div>

          <!-- Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select 
              v-model="form.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.status }"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
            <p v-if="errors.status" class="mt-1 text-sm text-red-600">
              {{ errors.status }}
            </p>
          </div>

          <!-- Botones -->
          <div class="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
              <span v-else>
                {{ mode === 'create' ? 'Crear Usuario' : 'Actualizar Usuario' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

// Props
const props = defineProps({
  user: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    required: true,
    validator: (value) => ['create', 'edit'].includes(value)
  }
})

// Emits
const emit = defineEmits(['close', 'saved'])

// Estado reactivo
const loading = ref(false)
const errors = reactive({})

// Formulario
const form = reactive({
  username: '',
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  status: 'active'
})

// Computed
const isEditMode = computed(() => props.mode === 'edit')

// Watchers
watch(() => props.user, (newUser) => {
  if (newUser && isEditMode.value) {
    form.username = newUser.username || ''
    form.fullName = newUser.full_name || newUser.name || ''
    form.email = newUser.email || ''
    form.role = newUser.role || ''
    form.status = newUser.status || newUser.isActive ? 'active' : 'inactive'
  }
}, { immediate: true })

// Methods
const validateForm = () => {
  errors.value = {}
  
  // Username validation
  if (!form.username.trim()) {
    errors.username = 'El nombre de usuario es requerido'
  } else if (form.username.length < 3) {
    errors.username = 'El nombre de usuario debe tener al menos 3 caracteres'
  }
  
  // Full name validation
  if (form.fullName && form.fullName.length < 2) {
    errors.fullName = 'El nombre completo debe tener al menos 2 caracteres'
  }
  
  // Email validation
  if (form.email && !isValidEmail(form.email)) {
    errors.email = 'Ingrese un email válido'
  }
  
  // Password validation (only for create mode)
  if (!isEditMode.value) {
    if (!form.password) {
      errors.password = 'La contraseña es requerida'
    } else if (form.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres'
    }
    
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden'
    }
  }
  
  // Role validation
  if (!form.role) {
    errors.role = 'El rol es requerido'
  }
  
  return Object.keys(errors).length === 0
}

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    const userData = {
      username: form.username.trim(),
      full_name: form.fullName.trim(),
      email: form.email.trim(),
      role: form.role,
      status: form.status
    }
    
    if (!isEditMode.value) {
      userData.password = form.password
    }
    
    // Aquí se llamaría a la API para crear/actualizar usuario
    console.log('Datos del usuario:', userData)
    
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('saved')
  } catch (error) {
    console.error('Error al guardar usuario:', error)
    // Aquí se manejarían los errores de la API
  } finally {
    loading.value = false
  }
}
</script> 