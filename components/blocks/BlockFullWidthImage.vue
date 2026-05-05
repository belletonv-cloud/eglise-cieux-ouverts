<template>
  <div class="full-width-image" :style="style"></div>
</template>

<script setup>
const props = defineProps({
  props: Object,
  visibility: Object,
})

const style = computed(() => ({
  backgroundImage: `url(${props.props.src})`,
  height: `${props.props.height}px`,
}))
</script>

<style scoped>
.full-width-image {
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
