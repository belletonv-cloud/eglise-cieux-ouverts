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
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

@media (min-width: 769px) {
  .full-width-image {
    background-attachment: fixed;
  }
}

@media (max-width: 768px) {
  .full-width-image {
    height: 210px;
    background-attachment: scroll;
  }
}
</style>
