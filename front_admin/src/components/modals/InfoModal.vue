<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div :class="iconClasses" class="w-8 h-8 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="type === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              <path v-else-if="type === 'warning'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <p class="text-gray-700">{{ message }}</p>
      </div>

      <!-- Footer -->
      <div class="flex justify-end p-6 border-t border-gray-200">
        <button
          @click="$emit('close')"
          :class="buttonClasses"
          class="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          Aceptar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Información'
  },
  message: {
    type: String,
    default: 'Mensaje informativo.'
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning'].includes(value)
  }
})

defineEmits(['close'])

// Computed properties
const iconClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-100 text-green-600'
    case 'warning':
      return 'bg-yellow-100 text-yellow-600'
    default:
      return 'bg-blue-100 text-blue-600'
  }
})

const buttonClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-600 focus:ring-green-500'
    case 'warning':
      return 'bg-yellow-600 focus:ring-yellow-500'
    default:
      return 'bg-blue-600 focus:ring-blue-500'
  }
})
</script> 