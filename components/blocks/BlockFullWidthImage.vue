<template>
  <div class="full-width-image" :style="style" :class="visibilityClasses" role="img" :aria-label="props.alt" data-field-key="src"></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  height: { type: Number, default: 400 },
  visibility: { type: Object, default: () => ({}) },
  previewDevice: { type: String, default: 'desktop' },
})

const visibilityClasses = computed(() => ({
  'hide-mobile': props.visibility.mobile === false,
  'hide-tablet': props.visibility.tablet === false,
  'hide-desktop': props.visibility.desktop === false,
}))

const style = computed(() => ({
  backgroundImage: `url(${props.src})`,
  height: `${props.height}px`,
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
