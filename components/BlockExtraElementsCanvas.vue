<template>
  <div ref="canvasRef" class="bee-canvas">
    <ClientOnly v-if="isAdmin">
      <VueDraggableResizable
        v-for="el in elements"
        :key="el.id"
        :x="pxX(el)"
        :y="pxY(el)"
        :w="pxW(el)"
        :h="pxH(el)"
        :parent="true"
        :z="10000"
        :active="el.id === selectedId"
        class="bee-el bee-el-drag"
        @activated="$emit('select', el.id)"
        @dragStop="(x, y) => onDragStop(el, x, y)"
        @resizeStop="(x, y, w, h) => onResizeStop(el, x, y, w, h)"
      >
        <BlockExtraElementContent :element="el" :is-admin="true" />
      </VueDraggableResizable>
      <template #fallback>
        <div v-for="el in elements" :key="el.id" class="bee-el" :style="elementStyle(el)">
          <BlockExtraElementContent :element="el" />
        </div>
      </template>
    </ClientOnly>
    <template v-else>
      <div v-for="el in elements" :key="el.id" class="bee-el" :style="elementStyle(el)">
        <BlockExtraElementContent :element="el" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ExtraElement } from '~/lib/blocks/types'
import VueDraggableResizable from 'vue-draggable-resizable'
import 'vue-draggable-resizable/style.css'

const props = defineProps<{
  elements: ExtraElement[]
  isAdmin?: boolean
  selectedId?: string | null
}>()

const emit = defineEmits<{
  select: [id: string]
  'update:elements': [elements: ExtraElement[]]
}>()

const canvasRef = ref<HTMLElement | null>(null)
const canvasSize = ref({ width: 0, height: 0 })

let resizeObserver: ResizeObserver | null = null
onMounted(() => {
  if (!canvasRef.value || typeof ResizeObserver === 'undefined') return
  const measure = () => {
    if (!canvasRef.value) return
    canvasSize.value = { width: canvasRef.value.clientWidth, height: canvasRef.value.clientHeight }
  }
  measure()
  resizeObserver = new ResizeObserver(measure)
  resizeObserver.observe(canvasRef.value)
})
onUnmounted(() => {
  resizeObserver?.disconnect()
})

// % -> px, utilisé uniquement pour piloter VueDraggableResizable (qui
// travaille en px). Le rendu public/statique reste en % pur via CSS.
function pxX(el: ExtraElement) { return (canvasSize.value.width * (el.xPct ?? 0)) / 100 }
function pxY(el: ExtraElement) { return (canvasSize.value.height * (el.yPct ?? 0)) / 100 }
function pxW(el: ExtraElement) { return (canvasSize.value.width * (el.wPct ?? 20)) / 100 }
function pxH(el: ExtraElement) { return (canvasSize.value.height * (el.hPct ?? 20)) / 100 }

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

// Commit uniquement au relâchement (dragStop/resizeStop), jamais sur chaque
// pixel intermédiaire — évite de noyer l'historique undo/redo et Firestore.
function commit(id: string, patch: Partial<ExtraElement>) {
  const updated = props.elements.map((e) => (e.id === id ? { ...e, ...patch } : e))
  emit('update:elements', updated)
}

function onDragStop(el: ExtraElement, x: number, y: number) {
  if (!canvasSize.value.width || !canvasSize.value.height) return
  commit(el.id, {
    xPct: (x / canvasSize.value.width) * 100,
    yPct: (y / canvasSize.value.height) * 100,
  })
}

function onResizeStop(el: ExtraElement, x: number, y: number, w: number, h: number) {
  if (!canvasSize.value.width || !canvasSize.value.height) return
  commit(el.id, {
    xPct: (x / canvasSize.value.width) * 100,
    yPct: (y / canvasSize.value.height) * 100,
    wPct: (w / canvasSize.value.width) * 100,
    hPct: (h / canvasSize.value.height) * 100,
  })
}
</script>

<style scoped>
.bee-canvas {
  /* Se superpose exactement sur le contenu du bloc (voir .block-wrapper
     dans PageRenderer.vue, qui fournit l'ancre position:relative) — pas
     de hauteur propre, le bloc garde sa taille naturelle. */
  position: absolute;
  inset: 0;
  overflow: hidden;
  /* Laisse passer les clics vers le contenu du bloc en dessous partout
     sauf sur les éléments eux-mêmes (réactivé ci-dessous). */
  pointer-events: none;
}
.bee-el {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}
/* Admin : l'élément entier capte le pointeur (drag / resize / sélection). */
.bee-el-drag {
  pointer-events: auto;
}
/* Public : les éléments héritent du pointer-events:none du canvas — un
   texte ou une image promus (souvent grands) ne bloquent donc pas les
   clics vers le contenu du bloc en dessous (ex: un bouton du Hero). Seuls
   les éléments réellement interactifs (boutons/liens) restent cliquables. */
.bee-el :deep(.bee-button) {
  pointer-events: auto;
}
.bee-el-drag :deep(.bee-text),
.bee-el-drag :deep(.bee-image) {
  width: 100%;
  height: 100%;
}
</style>
