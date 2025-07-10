<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Configuración</h1>
      <p class="mt-2 text-gray-600">Administra la configuración del sistema</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Menú lateral de configuración -->
      <div class="lg:col-span-1">
        <nav class="space-y-1">
          <button 
            v-for="section in sections" 
            :key="section.id"
            @click="activeSection = section.id"
            class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md"
            :class="activeSection === section.id ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
          >
            <component :is="section.icon" class="mr-3 h-5 w-5" />
            {{ section.name }}
          </button>
        </nav>
      </div>

      <!-- Contenido de configuración -->
      <div class="lg:col-span-2">
        <!-- Configuración General -->
        <div v-if="activeSection === 'general'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Configuración General</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Aplicación</label>
                <input 
                  type="text" 
                  v-model="settings.appName"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Zona Horaria</label>
                <select 
                  v-model="settings.timezone"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="America/Mexico_City">México (GMT-6)</option>
                  <option value="America/New_York">Nueva York (GMT-5)</option>
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                <select 
                  v-model="settings.language"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuración de Fotos -->
        <div v-if="activeSection === 'photos'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Configuración de Fotos</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Calidad de Imagen</label>
                <select 
                  v-model="settings.photoQuality"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tamaño Máximo (MB)</label>
                <input 
                  type="number" 
                  v-model="settings.maxPhotoSize"
                  min="1"
                  max="50"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Formato Permitido</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" v-model="settings.allowedFormats" value="jpg" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                    <span class="ml-2 text-sm text-gray-700">JPG</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" v-model="settings.allowedFormats" value="png" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                    <span class="ml-2 text-sm text-gray-700">PNG</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" v-model="settings.allowedFormats" value="heic" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                    <span class="ml-2 text-sm text-gray-700">HEIC</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuración de Notificaciones -->
        <div v-if="activeSection === 'notifications'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Configuración de Notificaciones</h3>
            
            <div class="space-y-4">
              <div>
                <label class="flex items-center">
                  <input type="checkbox" v-model="settings.emailNotifications" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="ml-2 text-sm font-medium text-gray-700">Notificaciones por Email</span>
                </label>
              </div>
              
              <div>
                <label class="flex items-center">
                  <input type="checkbox" v-model="settings.pushNotifications" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="ml-2 text-sm font-medium text-gray-700">Notificaciones Push</span>
                </label>
              </div>
              
              <div>
                <label class="flex items-center">
                  <input type="checkbox" v-model="settings.smsNotifications" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="ml-2 text-sm font-medium text-gray-700">Notificaciones SMS</span>
                </label>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email de Administrador</label>
                <input 
                  type="email" 
                  v-model="settings.adminEmail"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Configuración de Seguridad -->
        <div v-if="activeSection === 'security'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Configuración de Seguridad</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tiempo de Sesión (minutos)</label>
                <input 
                  type="number" 
                  v-model="settings.sessionTimeout"
                  min="15"
                  max="480"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              
              <div>
                <label class="flex items-center">
                  <input type="checkbox" v-model="settings.requireMFA" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="ml-2 text-sm font-medium text-gray-700">Requerir Autenticación de Dos Factores</span>
                </label>
              </div>
              
              <div>
                <label class="flex items-center">
                  <input type="checkbox" v-model="settings.logFailedAttempts" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="ml-2 text-sm font-medium text-gray-700">Registrar Intentos Fallidos de Login</span>
                </label>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Intentos Máximos de Login</label>
                <input 
                  type="number" 
                  v-model="settings.maxLoginAttempts"
                  min="3"
                  max="10"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Configuración de Backup -->
        <div v-if="activeSection === 'backup'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Configuración de Backup</h3>
            
            <div class="space-y-4">
              <div>
                <label class="flex items-center">
                  <input type="checkbox" v-model="settings.autoBackup" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="ml-2 text-sm font-medium text-gray-700">Backup Automático</span>
                </label>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Frecuencia de Backup</label>
                <select 
                  v-model="settings.backupFrequency"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Retención de Backups (días)</label>
                <input 
                  type="number" 
                  v-model="settings.backupRetention"
                  min="7"
                  max="365"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              
              <div class="flex space-x-4">
                <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Crear Backup Manual
                </button>
                <button class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                  Restaurar Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="mt-8 flex justify-end space-x-4">
      <button 
        @click="resetSettings"
        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
      >
        Restablecer
      </button>
      <button 
        @click="saveSettings"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Guardar Cambios
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Iconos para las secciones
const GeneralIcon = {
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>`
}

const PhotosIcon = {
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>`
}

const NotificationsIcon = {
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M9 11h.01M9 8h.01M9 5h.01M9 2h.01" />
  </svg>`
}

const SecurityIcon = {
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>`
}

const BackupIcon = {
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>`
}

// Estado reactivo
const activeSection = ref('general')

const sections = [
  { id: 'general', name: 'General', icon: GeneralIcon },
  { id: 'photos', name: 'Fotos', icon: PhotosIcon },
  { id: 'notifications', name: 'Notificaciones', icon: NotificationsIcon },
  { id: 'security', name: 'Seguridad', icon: SecurityIcon },
  { id: 'backup', name: 'Backup', icon: BackupIcon }
]

const settings = ref({
  // General
  appName: 'App Registro Fotos',
  timezone: 'America/Mexico_City',
  language: 'es',
  
  // Fotos
  photoQuality: 'high',
  maxPhotoSize: 10,
  allowedFormats: ['jpg', 'png'],
  
  // Notificaciones
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  adminEmail: 'admin@example.com',
  
  // Seguridad
  sessionTimeout: 120,
  requireMFA: false,
  logFailedAttempts: true,
  maxLoginAttempts: 5,
  
  // Backup
  autoBackup: true,
  backupFrequency: 'daily',
  backupRetention: 30
})

// Methods
const saveSettings = () => {
  console.log('Guardando configuración...', settings.value)
  // Aquí se implementaría la lógica para guardar la configuración
}

const resetSettings = () => {
  console.log('Restableciendo configuración...')
  // Aquí se implementaría la lógica para restablecer la configuración
}
</script> 