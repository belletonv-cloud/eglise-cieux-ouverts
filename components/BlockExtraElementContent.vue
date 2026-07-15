<template>
  <p v-if="element.kind === 'text' && element.text" class="bee-text">{{ element.text }}</p>
  <img
    v-else-if="element.kind === 'image' && element.imageUrl"
    class="bee-image"
    :src="element.imageUrl"
    :alt="element.imageAlt || ''"
    loading="lazy"
    draggable="false"
  />
  <a
    v-else-if="element.kind === 'button' && element.buttonLabel"
    class="bee-button"
    :href="element.buttonLink || '#'"
    @click="onButtonClick"
  >{{ element.buttonLabel }}</a>
</template>

<script setup lang="ts">
import type { ExtraElement } from '~/lib/blocks/types'

const props = defineProps<{
  element: ExtraElement
  isAdmin?: boolean
}>()

// En mode admin, le bouton est à l'intérieur d'une zone de drag/resize —
// suivre le lien romprait l'édition. Il reste cliquable normalement côté
// rendu public (isAdmin absent/false).
function onButtonClick(e: MouseEvent) {
  if (props.isAdmin) e.preventDefault()
}
</script>

<style scoped>
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
  pointer-events: none;
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
