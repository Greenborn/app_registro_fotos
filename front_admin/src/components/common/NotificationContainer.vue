<template>
  <div class="notification-container" :class="position">
    <TransitionGroup 
      name="notification" 
      tag="div" 
      class="notifications-list"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="notification.type"
        @click="removeNotification(notification.id)"
      >
        <div class="notification-icon">
          <svg v-if="notification.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <svg v-else-if="notification.type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <svg v-else-if="notification.type === 'warning'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        
        <div class="notification-content">
          <p class="notification-message">{{ notification.message }}</p>
          <p v-if="notification.details" class="notification-details">{{ notification.details }}</p>
        </div>
        
        <button 
          @click.stop="removeNotification(notification.id)"
          class="notification-close"
          title="Cerrar notificación"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        <!-- Barra de progreso -->
        <div 
          v-if="!notification.persistent && notification.duration > 0"
          class="notification-progress"
          :style="{ animationDuration: `${notification.duration}ms` }"
        ></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useNotifications } from '@/composables/useNotifications'

// Props
const props = defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'].includes(value)
  }
})

// Composables
const { notifications, removeNotification } = useNotifications()
</script>

<style scoped>
.notification-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
}

.notification-container.top-right {
  top: 1rem;
  right: 1rem;
}

.notification-container.top-left {
  top: 1rem;
  left: 1rem;
}

.notification-container.bottom-right {
  bottom: 1rem;
  right: 1rem;
}

.notification-container.bottom-left {
  bottom: 1rem;
  left: 1rem;
}

.notification-container.top-center {
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.notification-container.bottom-center {
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 400px;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  min-width: 300px;
}

.notification:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.notification.success {
  border-left: 4px solid #10b981;
}

.notification.success .notification-icon {
  color: #10b981;
}

.notification.error {
  border-left: 4px solid #dc2626;
}

.notification.error .notification-icon {
  color: #dc2626;
}

.notification.warning {
  border-left: 4px solid #f59e0b;
}

.notification.warning .notification-icon {
  color: #f59e0b;
}

.notification.info {
  border-left: 4px solid #3b82f6;
}

.notification.info .notification-icon {
  color: #3b82f6;
}

.notification-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  line-height: 1.4;
}

.notification-details {
  margin: 0.25rem 0 0 0;
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.3;
}

.notification-close {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s;
  margin-top: 0.125rem;
}

.notification-close:hover {
  background-color: #f3f4f6;
  color: #6b7280;
}

.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: currentColor;
  animation: progress-shrink linear forwards;
}

@keyframes progress-shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Animaciones de entrada y salida */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 640px) {
  .notification-container {
    left: 1rem;
    right: 1rem;
    transform: none;
  }
  
  .notification-container.top-right,
  .notification-container.top-left,
  .notification-container.bottom-right,
  .notification-container.bottom-left {
    left: 1rem;
    right: 1rem;
    transform: none;
  }
  
  .notifications-list {
    max-width: none;
  }
  
  .notification {
    min-width: auto;
  }
}
</style> 