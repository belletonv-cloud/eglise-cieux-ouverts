<template>
  <div class="field-array">
    <div
      v-for="(url, idx) in localItems"
      :key="idx + '-' + (url || '')"
      class="array-item"
    >
      <div class="array-item-header">
        <span class="array-item-num">#{{ idx + 1 }}</span>
        <button
          class="array-item-del"
          @click="removeItem(idx)"
          aria-label="Supprimer l'image {{ idx + 1 }}"
        >✕</button>
      </div>
      <input
        type="text"
        class="field-input"
        placeholder="URL image"
        :value="url"
        @input="updateItem(idx, ($event.target as HTMLInputElement).value)"
      />
      <img v-if="url" :src="url" class="field-image-preview" alt="Aperçu image {{ idx + 1 }}" />
    </div>
    <div class="array-actions">
      <button
        class="array-add-btn"
        @click="addItem"
        aria-label="Ajouter une image"
      >+ Ajouter une image</button>
      <button
        v-if="localItems.length > 0"
        class="array-clear-btn"
        @click="clearAll"
        aria-label="Tout supprimer"
      >🗑️ Tout supprimer</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ value: any; field: any }>()
const emit = defineEmits<{ change: [value: string[]] }>()

let isEditing = false
const localItems = ref<string[]>([])

function initItems(val: any) {
  localItems.value = Array.isArray(val) ? [...val] : []
}

initItems(props.value)

watch(() => props.value, (v) => {
  if (!isEditing) initItems(v)
}, { deep: true })

function emitChange() {
  isEditing = true
  emit('change', [...localItems.value])
  setTimeout(() => { isEditing = false }, 0)
}

function updateItem(idx: number, val: string) {
  localItems.value[idx] = val
  emitChange()
}

function removeItem(idx: number) {
  localItems.value.splice(idx, 1)
  emitChange()
}

function addItem() {
  localItems.value.push('')
  emitChange()
}

function clearAll() {
  localItems.value = []
  emitChange()
}
</script>

<style scoped>
.field-array { display: flex; flex-direction: column; gap: 10px; }
.array-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px; }
.array-item-header { display: flex; align-items: center; justify-content: space-between; }
.array-item-num { font-size: 0.72em; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.08em; }
.array-item-del { background: none; border: none; color: #EF4B54; cursor: pointer; font-size: 0.85em; padding: 2px 5px; border-radius: 4px; }
.array-item-del:hover { background: rgba(239,75,84,0.1); }
.array-actions { display: flex; gap: 8px; align-items: stretch; }
.array-add-btn { background: #f3f4f6; border: 1.5px dashed #d1d5db; border-radius: 8px; color: #555; font-size: 0.82em; padding: 8px; cursor: pointer; flex: 1; }
.array-add-btn:hover { border-color: #064886; color: #064886; background: #eef4fa; }
.array-clear-btn { background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 8px; color: #EF4B54; font-size: 0.82em; padding: 8px 12px; cursor: pointer; white-space: nowrap; }
.array-clear-btn:hover { background: #fee2e2; border-color: #EF4B54; }
.field-input { width: 100%; padding: 7px 10px; background: #fff; border: 1px solid #ddd; border-radius: 6px; color: #1a1a2e; font-size: 0.88em; outline: none; font-family: inherit; }
.field-image-preview { width: 100%; max-height: 60px; object-fit: cover; border-radius: 6px; }
</style>
