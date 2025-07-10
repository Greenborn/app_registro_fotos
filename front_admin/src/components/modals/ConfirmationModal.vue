<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <button @click="$emit('cancel')" class="close-btn">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="modal-icon">
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <p class="modal-message">{{ message }}</p>
      </div>

      <div class="modal-footer">
        <button @click="$emit('cancel')" class="btn-secondary">
          {{ cancelText }}
        </button>
        <button @click="$emit('confirm')" class="btn-danger">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
defineProps({
  title: {
    type: String,
    default: 'Confirmar Acción'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  }
})

// Emits
defineEmits(['confirm', 'cancel'])

// Methods
const handleOverlayClick = () => {
  // Solo cerrar si se hace click en el overlay, no en el modal
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  width: 2rem;
  height: 2rem;
  background-color: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #e5e7eb;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.modal-icon {
  margin-bottom: 1rem;
  color: #f59e0b;
}

.modal-message {
  color: #374151;
  margin: 0;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.btn-secondary {
  flex: 1;
  padding: 0.75rem 1rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-danger {
  flex: 1;
  padding: 0.75rem 1rem;
  background-color: #dc2626;
  color: white;
  border: 1px solid #dc2626;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background-color: #b91c1c;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    margin: 1rem;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style> 