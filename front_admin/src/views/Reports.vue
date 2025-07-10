<template>
  <Navigation>
    <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Reportes</h1>
      <p class="mt-2 text-gray-600">Genera y visualiza reportes de actividad</p>
    </div>

    <!-- Filtros de fecha -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
          <input 
            type="date" 
            v-model="dateFrom"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
          <input 
            type="date" 
            v-model="dateTo"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Operador</label>
          <select 
            v-model="selectedOperator"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los operadores</option>
            <option value="1">Juan Pérez</option>
            <option value="2">María García</option>
            <option value="3">Carlos López</option>
          </select>
        </div>
        <button 
          @click="generateReport"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Generar Reporte
        </button>
      </div>
    </div>

    <!-- Tarjetas de resumen -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">Total Fotos</h3>
            <p class="text-2xl font-bold text-gray-900">{{ summary.totalPhotos }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">Aprobadas</h3>
            <p class="text-2xl font-bold text-gray-900">{{ summary.approvedPhotos }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">Rechazadas</h3>
            <p class="text-2xl font-bold text-gray-900">{{ summary.rejectedPhotos }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">Operadores</h3>
            <p class="text-2xl font-bold text-gray-900">{{ summary.activeOperators }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Gráfico de fotos por día -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Fotos por Día</h3>
        <div class="h-64 bg-gray-50 rounded flex items-center justify-center">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p class="text-gray-600">Gráfico de fotos por día</p>
          </div>
        </div>
      </div>

      <!-- Gráfico de operadores -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Actividad por Operador</h3>
        <div class="h-64 bg-gray-50 rounded flex items-center justify-center">
          <div class="text-center">
            <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-gray-600">Gráfico de actividad por operador</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de reporte detallado -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">Reporte Detallado</h3>
          <button class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Exportar PDF
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operador
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fotos Totales
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aprobadas
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rechazadas
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tasa Aprobación
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horas Activas
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="operator in operatorStats" :key="operator.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-700">{{ operator.initials }}</span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ operator.name }}</div>
                    <div class="text-sm text-gray-500">{{ operator.zone }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ operator.totalPhotos }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ operator.approvedPhotos }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ operator.rejectedPhotos }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      class="bg-green-500 h-2 rounded-full" 
                      :style="{ width: operator.approvalRate + '%' }"
                    ></div>
                  </div>
                  <span class="text-sm text-gray-900">{{ operator.approvalRate }}%</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ operator.activeHours }}h
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  </Navigation>
</template>

<script setup>
import { ref, computed } from 'vue'
import Navigation from '@/components/common/Navigation.vue'

// Estado reactivo
const dateFrom = ref('')
const dateTo = ref('')
const selectedOperator = ref('')

// Datos de ejemplo
const summary = ref({
  totalPhotos: 1247,
  approvedPhotos: 1189,
  rejectedPhotos: 58,
  activeOperators: 12
})

const operatorStats = ref([
  {
    id: 1,
    name: 'Juan Pérez',
    initials: 'JP',
    zone: 'Zona Norte',
    totalPhotos: 156,
    approvedPhotos: 148,
    rejectedPhotos: 8,
    approvalRate: 95,
    activeHours: 42
  },
  {
    id: 2,
    name: 'María García',
    initials: 'MG',
    zone: 'Zona Sur',
    totalPhotos: 142,
    approvedPhotos: 135,
    rejectedPhotos: 7,
    approvalRate: 95,
    activeHours: 38
  },
  {
    id: 3,
    name: 'Carlos López',
    initials: 'CL',
    zone: 'Zona Este',
    totalPhotos: 134,
    approvedPhotos: 127,
    rejectedPhotos: 7,
    approvalRate: 95,
    activeHours: 35
  }
])

// Methods
const generateReport = () => {
  console.log('Generando reporte...', {
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
    operator: selectedOperator.value
  })
  // Aquí se implementaría la lógica para generar el reporte
}
</script> 