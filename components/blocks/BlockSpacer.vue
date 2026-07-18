<template>
  <div
    class="block-spacer"
    :style="style"
    :class="visibilityClasses"
  >
    <template v-if="text || image">
      <img v-if="image" :src="image" :alt="text" class="spacer-img" data-field-key="image" loading="lazy" />
      <p v-if="text" class="spacer-text" data-field-key="text" :style="{ textAlign: contentAlign, ...fieldFontStyle(fieldFonts, 'text', fieldFontSizes) }">{{ text }}</p>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { fieldFontStyle } from '~/utils/fonts.js'

const {
  visibility = {},
  height = 60,
  backgroundColor = 'transparent',
  text = '',
  image = '',
  contentAlign = 'center',
  contentVerticalAlign = 'middle',
  fieldFonts = {},
  fieldFontSizes = {},
} = defineProps({
  height: { type: Number, default: 60 },
  backgroundColor: { type: String, default: 'transparent' },
  text: { type: String, default: '' },
  image: { type: String, default: '' },
  contentAlign: { type: String, default: 'center' },
  contentVerticalAlign: { type: String, default: 'middle' },
  visibility: { type: Object, default: () => ({}) },
  isTriggered: { type: Boolean, default: false },
  previewDevice: { type: String, default: 'desktop' },
  fieldFonts: { type: Object, default: () => ({}) },
  fieldFontSizes: { type: Object, default: () => ({}) },
})
const visibilityClasses = computed(() => ({
  'hide-mobile': visibility.mobile === false,
  'hide-tablet': visibility.tablet === false,
  'hide-desktop': visibility.desktop === false,
}))
const ALIGN_ITEMS_MAP = { left: 'flex-start', center: 'center', right: 'flex-end' }
const JUSTIFY_CONTENT_MAP = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }
// Un espace vide "pur" garde height fixe (comportement historique inchangé).
// Dès qu'il y a du contenu, height devient un minimum pour ne pas couper
// le texte/l'image si la hauteur configurée est petite (ex: 60px par défaut),
// et l'alignement devient pertinent (sans contenu, centré ou non ne change rien).
const style = computed(() => {
  const hasContent = !!(text || image)
  return {
    [hasContent ? 'minHeight' : 'height']: height + 'px',
    background: backgroundColor || 'transparent',
    alignItems: ALIGN_ITEMS_MAP[contentAlign] || 'center',
    justifyContent: JUSTIFY_CONTENT_MAP[contentVerticalAlign] || 'center',
  }
})
</script>

<style scoped>
.block-spacer {
  display: flex;
  flex-direction: column;
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
