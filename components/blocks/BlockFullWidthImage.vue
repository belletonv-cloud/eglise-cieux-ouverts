<template>
  <div class="full-width-image" :style="style" :class="visibilityClasses"></div>
</template>

<script setup>
import { computed } from 'vue'

const {
  src = '',
  height = 400,
  visibility = {},
  previewDevice = 'desktop',
} = defineProps({
  src: { type: String, default: '' },
  height: { type: Number, default: 400 },
  visibility: { type: Object, default: () => ({}) },
  previewDevice: { type: String, default: 'desktop' },
})

const visibilityClasses = computed(() => ({
  'hide-mobile': visibility.mobile === false,
  'hide-tablet': visibility.tablet === false,
  'hide-desktop': visibility.desktop === false,
}))

const style = computed(() => ({
  backgroundImage: `url(${src})`,
  height: `${height}px`,
}))
</script>

<style scoped>
.full-width-image {
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

@media (max-width: 768px) {
  .full-width-image {
    background-attachment: scroll;
  }
}
</style>
