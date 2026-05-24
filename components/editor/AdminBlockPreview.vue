<template>
  <div
    class="admin-block-preview"
    :class="`block-preview-${blockType}`"
  >
    <div class="preview-icon">{{ blockDef?.icon }}</div>
    <div class="preview-label">{{ blockDef?.label }}</div>
    <div class="preview-fields-count">{{ schema.length }} champs</div>
    <div class="preview-thumb" v-if="thumbnail">
      <img :src="thumbnail" alt="preview" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BLOCK_TYPES } from '~/utils/blockTypes.js'

const props = defineProps<{
  blockType: string
}>()

const blockDef = BLOCK_TYPES[props.blockType as keyof typeof BLOCK_TYPES]
const schema = blockDef?.schema || []

const thumbnail = computed(() => {
  if (!blockDef) return ''
  const imgField = schema.find((f: any) => f.type === 'image')
  if (imgField) return blockDef.defaults[imgField.key]
  return ''
})
</script>

<style scoped>
.admin-block-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: #1e1e2e;
  border: 1px solid #2d2d3f;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s;
  width: 100%;
  text-align: center;
}
.admin-block-preview:hover {
  border-color: #064886;
}
.preview-icon {
  font-size: 1.5em;
}
.preview-label {
  font-size: 0.78em;
  color: #e2e8f0;
  font-weight: 600;
}
.preview-fields-count {
  font-size: 0.65em;
  color: #7c7c9a;
}
.preview-thumb img {
  width: 100%;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  margin-top: 4px;
}
</style>
