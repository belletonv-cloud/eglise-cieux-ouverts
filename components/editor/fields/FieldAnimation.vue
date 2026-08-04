<template>
  <div class="field-animations">
    <button
      v-for="anim in choix"
      :key="anim.id"
      class="anim-btn"
      :class="{ active: value === anim.id }"
      :aria-pressed="value === anim.id"
      @click="$emit('change', anim.id)"
    >{{ anim.label }}</button>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { ANIMATIONS, ANIMATION_ORIGINE, BLOCS_AVEC_ANIMATION_PROPRE } from '~/utils/blockTypes.js'
defineProps<{ value: any; field: any }>()
defineEmits<{ change: [value: string] }>()

// Fourni par AutoEditor : seuls certains blocs embarquent une animation
// propre, et proposer « D'origine » ailleurs ne ferait rien de visible.
const blockType = inject<any>('blockType', ref(''))

const choix = computed(() => {
  const type = typeof blockType === 'string' ? blockType : blockType?.value
  return BLOCS_AVEC_ANIMATION_PROPRE.includes(type)
    ? [...ANIMATIONS, ANIMATION_ORIGINE]
    : ANIMATIONS
})
</script>

<style scoped>
.field-animations {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.anim-btn {
  padding: 5px 10px;
  background: #f9fafb;
  border: 1.5px solid #ddd;
  border-radius: 20px;
  color: #555;
  font-size: 0.75em;
  cursor: pointer;
  transition: all 0.15s;
}
.anim-btn.active {
  background: #064886;
  border-color: #064886;
  color: white;
  font-weight: 600;
}
.anim-btn:hover { border-color: #064886; color: #064886; }
.anim-btn.active:hover { color: white; }
</style>
