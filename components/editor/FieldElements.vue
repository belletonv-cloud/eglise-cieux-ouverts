<template>
  <div class="field-elements">
    <VueDraggable
      v-model="localItems"
      handle=".array-drag-handle"
      ghost-class="array-item-ghost"
      :animation="200"
      :force-fallback="true"
      tag="div"
      class="field-array-list"
      @end="emitChange"
    >
      <div
        v-for="(item, idx) in localItems"
        :key="item._key"
        class="array-item"
        :class="{ 'array-item-selected': item.id === selectedId }"
        @click="$emit('select', item.id)"
      >
        <div class="array-item-header">
          <span class="array-drag-handle" title="Glisser pour réordonner (ordre d'empilement)">⠿</span>
          <span class="array-item-num">{{ kindLabel(item.kind) }} #{{ idx + 1 }}</span>
          <button
            class="array-item-del"
            @click.stop="removeItem(idx)"
            aria-label="Supprimer l'élément"
          >✕</button>
        </div>

        <template v-if="item.kind === 'text'">
          <textarea
            class="field-textarea"
            rows="2"
            placeholder="Texte"
            :value="item.text"
            @input="updateItem(idx, { text: ($event.target as HTMLTextAreaElement).value })"
            @click.stop
          ></textarea>
        </template>

        <template v-else-if="item.kind === 'richtext'">
          <textarea
            class="field-textarea field-textarea-html"
            rows="4"
            placeholder="Contenu HTML"
            :value="item.text"
            @input="updateItem(idx, { text: ($event.target as HTMLTextAreaElement).value })"
            @click.stop
          ></textarea>
        </template>

        <template v-else-if="item.kind === 'image'">
          <input
            type="text"
            class="field-input"
            placeholder="URL image"
            :value="item.imageUrl"
            @input="updateItem(idx, { imageUrl: ($event.target as HTMLInputElement).value })"
            @click.stop
          />
          <input
            type="text"
            class="field-input"
            placeholder="Texte alternatif"
            :value="item.imageAlt"
            @input="updateItem(idx, { imageAlt: ($event.target as HTMLInputElement).value })"
            @click.stop
          />
          <img v-if="item.imageUrl" :src="item.imageUrl" class="field-image-preview" alt="Aperçu" />
        </template>

        <template v-else-if="item.kind === 'button'">
          <input
            type="text"
            class="field-input"
            placeholder="Texte du bouton"
            :value="item.buttonLabel"
            @input="updateItem(idx, { buttonLabel: ($event.target as HTMLInputElement).value })"
            @click.stop
          />
          <input
            type="text"
            class="field-input"
            placeholder="Lien"
            :value="item.buttonLink"
            @input="updateItem(idx, { buttonLink: ($event.target as HTMLInputElement).value })"
            @click.stop
          />
        </template>
      </div>
    </VueDraggable>

    <div class="array-actions">
      <button class="array-add-btn" @click="addItem('text')">+ Texte</button>
      <button class="array-add-btn" @click="addItem('image')">+ Image</button>
      <button class="array-add-btn" @click="addItem('button')">+ Bouton</button>
    </div>
    <p class="field-elements-hint">
      Ajoute, réordonne (ordre d'empilement) ou supprime le contenu ici. Pour déplacer/redimensionner un élément, sélectionne-le puis glisse-le directement sur la page.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import type { ExtraElement, ExtraElementKind } from '~/lib/blocks/types'

const props = defineProps<{
  elements: ExtraElement[]
  selectedId?: string | null
}>()

const emit = defineEmits<{
  change: [elements: ExtraElement[]]
  select: [id: string]
}>()

let isEditing = false
let nextKey = 0
let nextId = 0
const localItems = ref<(ExtraElement & { _key: number })[]>([])

function initItems(val: ExtraElement[]) {
  localItems.value = Array.isArray(val) ? val.map((item) => ({ ...item, _key: nextKey++ })) : []
}

initItems(props.elements)

watch(() => props.elements, (v) => {
  if (!isEditing) initItems(v)
}, { deep: true })

function kindLabel(kind: ExtraElementKind) {
  if (kind === 'text') return 'Texte'
  if (kind === 'richtext') return 'Texte HTML'
  if (kind === 'image') return 'Image'
  return 'Bouton'
}

function emitChange() {
  isEditing = true
  emit('change', localItems.value.map(({ _key, ...rest }) => rest))
  setTimeout(() => { isEditing = false }, 0)
}

function updateItem(idx: number, patch: Partial<ExtraElement>) {
  localItems.value[idx] = { ...localItems.value[idx], ...patch }
  emitChange()
}

function removeItem(idx: number) {
  localItems.value.splice(idx, 1)
  emitChange()
}

function addItem(kind: ExtraElementKind) {
  // Décale légèrement chaque nouvel élément par rapport au précédent :
  // sans ça, plusieurs éléments créés à la suite démarrent exactement à
  // la même position et se superposent parfaitement, ce qui donne
  // l'impression qu'un déplacement ne fait rien (l'élément du dessous
  // reste visible au même endroit).
  const offset = (localItems.value.length % 5) * 4
  const base: ExtraElement = {
    id: `el-${Date.now()}-${nextId++}`,
    kind,
    xPct: 10 + offset,
    yPct: 10 + offset,
    wPct: 30,
    hPct: 20,
    z: localItems.value.length,
  }
  if (kind === 'button') base.buttonLabel = 'En savoir plus'
  localItems.value.push({ ...base, _key: nextKey++ })
  emitChange()
  emit('select', base.id)
}
</script>

<style scoped>
.field-elements { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.field-array-list { display: flex; flex-direction: column; gap: 10px; min-height: 4px; }
.array-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px; cursor: pointer; }
.array-item-selected { border-color: #064886; box-shadow: 0 0 0 2px rgba(6, 72, 134, 0.15); }
.array-item-ghost { opacity: 0.4; outline: 2px dashed #064886; outline-offset: -2px; }
.array-item-header { display: flex; align-items: center; gap: 8px; }
.array-drag-handle { cursor: grab; color: #9ca3af; font-size: 14px; user-select: none; }
.array-drag-handle:hover { color: #064886; }
.array-item-num { font-size: 0.72em; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.08em; flex: 1; }
.array-item-del { background: none; border: none; color: #EF4B54; cursor: pointer; font-size: 0.85em; padding: 2px 5px; border-radius: 4px; }
.array-item-del:hover { background: rgba(239,75,84,0.1); }
.array-actions { display: flex; gap: 8px; }
.array-add-btn { flex: 1; background: #f3f4f6; border: 1.5px dashed #d1d5db; border-radius: 8px; color: #555; font-size: 0.8em; padding: 8px; cursor: pointer; }
.array-add-btn:hover { border-color: #064886; color: #064886; background: #eef4fa; }
.field-input, .field-textarea { width: 100%; padding: 7px 10px; background: #fff; border: 1px solid #ddd; border-radius: 6px; color: #1a1a2e; font-size: 0.88em; outline: none; font-family: inherit; }
.field-textarea { resize: vertical; min-height: 50px; }
.field-textarea-html { font-family: monospace; }
.field-image-preview { width: 100%; max-height: 60px; object-fit: cover; border-radius: 6px; }
.field-elements-hint { font-size: 0.75em; color: #999; margin: 0; line-height: 1.4; }
</style>
