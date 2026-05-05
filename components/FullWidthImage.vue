<template>
  <div class="full-width-image" :style="{ backgroundImage: `url(${src})` }"></div>
</template>

<script setup>
defineProps({
  src: String
})
</script>

<style scoped>
.full-width-image {
  height: 400px;
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
