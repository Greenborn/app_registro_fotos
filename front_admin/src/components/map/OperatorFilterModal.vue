<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
      <h2 class="text-lg font-bold mb-4">Filtrar operadores</h2>
      <div v-if="!operators.length" class="text-center text-gray-500 py-8">
        Cargando operadores...
      </div>
      <div v-else class="max-h-64 overflow-y-auto divide-y divide-gray-100 mb-4">
        <div v-for="op in operators" :key="op.id" class="py-2 flex items-center">
          <input type="checkbox" :id="'op-' + op.id" :value="op.id" v-model="localSelected" class="mr-2">
          <label :for="'op-' + op.id" class="text-sm text-gray-700 cursor-pointer">{{ op.name || op.nombre || op.username }}</label>
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <button @click="$emit('close')" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700">Cerrar</button>
        <button @click="applySelection" class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">Aplicar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, toRefs } from 'vue'

const props = defineProps({
  show: Boolean,
  operators: {
    type: Array,
    required: true
  },
  selected: {
    type: Array,
    required: true
  }
})
const emit = defineEmits(['update:selected', 'close'])

const localSelected = ref([...props.selected])

watch(() => props.selected, (val) => {
  localSelected.value = [...val]
})

// Nuevo watcher para sincronizar cuando llegan los operadores
watch(
  () => props.operators,
  (val) => {
    if (val.length && !localSelected.value.length) {
      localSelected.value = val.map(op => op.id)
    }
  },
  { immediate: true }
)

function applySelection() {
  emit('update:selected', localSelected.value)
  emit('close')
}
</script>

<style scoped>
.fixed {
  backdrop-filter: blur(2px);
}
</style> 