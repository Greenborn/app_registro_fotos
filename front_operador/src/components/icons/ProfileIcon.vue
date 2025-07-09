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
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
</template>

<script>
export default {
  name: 'ProfileIcon',
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