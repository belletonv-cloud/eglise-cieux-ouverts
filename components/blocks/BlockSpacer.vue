<template>
  <div
    class="block-spacer"
    :style="style"
    :class="visibilityClasses"
  >
    <template v-if="text || image">
      <img v-if="image" :src="image" :alt="text" class="spacer-img" loading="lazy" />
      <p v-if="text" class="spacer-text">{{ text }}</p>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const { visibility = {}, height = 60, backgroundColor = 'transparent', text = '', image = '' } = defineProps({
  height: { type: Number, default: 60 },
  backgroundColor: { type: String, default: 'transparent' },
  text: { type: String, default: '' },
  image: { type: String, default: '' },
  visibility: { type: Object, default: () => ({}) },
  isTriggered: { type: Boolean, default: false },
  previewDevice: { type: String, default: 'desktop' },
})
const visibilityClasses = computed(() => ({
  'hide-mobile': visibility.mobile === false,
  'hide-tablet': visibility.tablet === false,
  'hide-desktop': visibility.desktop === false,
}))
// Un espace vide "pur" garde height fixe (comportement historique inchangé).
// Dès qu'il y a du contenu, height devient un minimum pour ne pas couper
// le texte/l'image si la hauteur configurée est petite (ex: 60px par défaut).
const style = computed(() => {
  const hasContent = !!(text || image)
  return {
    [hasContent ? 'minHeight' : 'height']: height + 'px',
    background: backgroundColor || 'transparent',
  }
})
</script>

<style scoped>
.block-spacer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.spacer-img {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
}
.spacer-text {
  margin: 0;
  text-align: center;
  padding: 0 16px;
}
</style>
