<template>
  <div class="block-image">
    <img :src="src" alt="Image de contenu" v-if="src" loading="lazy" />
    <button v-if="editable" @click="pick">Choisir une image</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const { src, editable } = defineProps({
  src: { type: String, default: '' },
  editable: Boolean
})
const emits = defineEmits(['update:src'])

function pick() {
  // (Squelette; à compléter pour vrai picker)
  let newUrl = window.prompt('URL de l’image :')
  emits('update:src', newUrl)
}
</script>

<style scoped>
.block-image {
  background: #e8f6ff;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}
.block-image img {
  max-width: 100%;
  display: block;
  margin: 0 auto;
}
</style>
