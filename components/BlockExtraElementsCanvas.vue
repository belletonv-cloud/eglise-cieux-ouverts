<template>
  <div class="bee-canvas" :style="{ height: canvasHeight + 'px' }">
    <div
      v-for="el in elements"
      :key="el.id"
      class="bee-el"
      :style="elementStyle(el)"
    >
      <p v-if="el.kind === 'text' && el.text" class="bee-text">{{ el.text }}</p>
      <img
        v-else-if="el.kind === 'image' && el.imageUrl"
        class="bee-image"
        :src="el.imageUrl"
        :alt="el.imageAlt || ''"
        loading="lazy"
      />
      <a
        v-else-if="el.kind === 'button' && el.buttonLabel"
        class="bee-button"
        :href="el.buttonLink || '#'"
      >{{ el.buttonLabel }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExtraElement } from '~/lib/blocks/types'

const props = defineProps<{
  elements: ExtraElement[]
  canvasHeight?: number
}>()

const canvasHeight = computed(() => props.canvasHeight || 300)

// % de la zone canvas -> style CSS absolu. Le canvas fait toujours 100% de
// la largeur du bloc parent, donc les % se convertissent directement sans
// mesure de largeur réelle nécessaire côté rendu public (contrairement au
// mode admin interactif qui convertit px<->% via ResizeObserver).
function elementStyle(el: ExtraElement) {
  return {
    position: 'absolute' as const,
    left: (el.xPct ?? 0) + '%',
    top: (el.yPct ?? 0) + '%',
    width: (el.wPct ?? 20) + '%',
    height: (el.hPct ?? 20) + '%',
    zIndex: el.z ?? 0,
  }
}
</script>

<style scoped>
.bee-canvas {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.bee-el {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}
.bee-text {
  margin: 0;
  font-size: 1.05em;
  line-height: 1.5;
}
.bee-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
.bee-button {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 50px;
  background: #064886;
  color: white;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}
.bee-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}
</style>
