<template>
  <div class="field-array">
    <div
      v-for="(item, idx) in localItems"
      :key="getItemKey(item, idx)"
      class="array-item"
    >
      <div class="array-item-header">
        <span class="array-item-num">#{{ idx + 1 }}</span>
        <button
          class="array-item-del"
          @click="removeItem(idx)"
          aria-label="Supprimer l'élément {{ idx + 1 }}"
        >✕</button>
      </div>
      <template v-if="hasSubFields">
        <div
          v-for="sub in field.subFields"
          :key="sub.key"
          class="sub-field"
        >
          <label class="sub-field-label">{{ sub.label }}</label>
          <input
            v-if="sub.type === 'text'"
            type="text"
            class="field-input"
            :placeholder="sub.placeholder || sub.label"
            :value="item[sub.key]"
            @input="updateItem(idx, sub.key, ($event.target as HTMLInputElement).value)"
          />
          <textarea
            v-else-if="sub.type === 'textarea'"
            class="field-textarea"
            rows="3"
            :placeholder="sub.placeholder || sub.label"
            :value="item[sub.key]"
            @input="updateItem(idx, sub.key, ($event.target as HTMLTextAreaElement).value)"
          ></textarea>
        </div>
      </template>
      <template v-else>
        <input
          type="text"
          class="field-input"
          placeholder="Titre"
          :value="item.title"
          @input="updateItem(idx, 'title', ($event.target as HTMLInputElement).value)"
        />
        <textarea
          class="field-textarea"
          rows="3"
          placeholder="Description"
          :value="item.description"
          @input="updateItem(idx, 'description', ($event.target as HTMLTextAreaElement).value)"
        ></textarea>
        <input
          type="text"
          class="field-input"
          placeholder="URL image"
          :value="item.image"
          @input="updateItem(idx, 'image', ($event.target as HTMLInputElement).value)"
        />
        <img v-if="item.image" :src="item.image" class="field-image-preview" alt="preview" />
      </template>
    </div>
    <button class="array-add-btn" @click="addItem" :aria-label="'Ajouter un élément à ' + (field.label || 'la liste')">
      + Ajouter
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{ value: any; field: any }>()
const emit = defineEmits<{ change: [value: any[]] }>()

let isEditing = false
const localItems = ref<any[]>([])

function initItems(val: any) {
  localItems.value = Array.isArray(val) ? val.map(item => ({ ...item })) : []
}

initItems(props.value)

watch(() => props.value, (v) => {
  if (!isEditing) initItems(v)
}, { deep: true })

const hasSubFields = computed(() => {
  return Array.isArray(props.field?.subFields) && props.field.subFields.length > 0
})

function getEmptyItem(): any {
  if (hasSubFields.value) {
    const item: any = {}
    for (const sub of props.field.subFields) {
      item[sub.key] = ''
    }
    return item
  }
  return { title: '', description: '', image: '' }
}

function getItemKey(item: any, idx: number): string {
  if (item._key) return item._key
  const stable = hasSubFields.value
    ? props.field.subFields.map((s: any) => item[s.key]).join('|')
    : item.title || ''
  return idx + '-' + stable
}

function emitChange() {
  isEditing = true
  emit('change', localItems.value.map(item => ({ ...item })))
  setTimeout(() => { isEditing = false }, 0)
}

function updateItem(idx: number, prop: string, val: string) {
  localItems.value[idx] = { ...localItems.value[idx], [prop]: val }
  emitChange()
}

function removeItem(idx: number) {
  localItems.value.splice(idx, 1)
  emitChange()
}

function addItem() {
  localItems.value.push(getEmptyItem())
  emitChange()
}
</script>

<style scoped>
.field-array { display: flex; flex-direction: column; gap: 10px; }
.array-item { background: #13131f; border: 1px solid #2d2d3f; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px; }
.array-item-header { display: flex; align-items: center; justify-content: space-between; }
.array-item-num { font-size: 0.72em; font-weight: 700; color: #7c7c9a; text-transform: uppercase; letter-spacing: 0.08em; }
.array-item-del { background: none; border: none; color: #EF4B54; cursor: pointer; font-size: 0.85em; padding: 2px 5px; border-radius: 4px; }
.array-item-del:hover { background: rgba(239,75,84,0.1); }
.array-add-btn { background: #2d2d3f; border: 1.5px dashed #3d3d55; border-radius: 8px; color: #9999bb; font-size: 0.82em; padding: 8px; cursor: pointer; }
.array-add-btn:hover { border-color: #064886; color: white; }
.sub-field { display: flex; flex-direction: column; gap: 3px; }
.sub-field-label { font-size: 0.7em; color: #7c7c9a; font-weight: 500; }
.field-input, .field-textarea { width: 100%; padding: 7px 10px; background: #2d2d3f; border: 1px solid #3d3d55; border-radius: 6px; color: #e2e8f0; font-size: 0.88em; outline: none; font-family: inherit; }
.field-textarea { resize: vertical; min-height: 60px; }
.field-image-preview { width: 100%; max-height: 60px; object-fit: cover; border-radius: 6px; }
</style>
