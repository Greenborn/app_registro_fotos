<template>
  <svg 
    :class="classes" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
</template>

<script>
export default {
  name: 'CameraIcon',
  props: {
    size: {
      type: String,
      default: 'w-6 h-6'
    },
    class: {
      type: String,
      default: ''
    }
  },
  computed: {
    classes() {
      return `${this.size} ${this.class}`
    }
  }
}
</script> 