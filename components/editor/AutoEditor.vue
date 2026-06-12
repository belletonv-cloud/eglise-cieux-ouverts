<template>
  <div class="sidebar-autoeditor auto-editor">
    <EditorFieldError
      v-for="field in schema"
      :key="field.key"
      :field-key="field.key"
    >
      <div class="auto-field">
        <label class="field-label">{{ field.label }}</label>
        <component
          :is="fieldComponent(field.type)"
          :field="field"
          :value="modelValue?.props?.[field.key]"
          @change="onChange(field.key, $event)"
        />
      </div>
    </EditorFieldError>
    <FieldDesign
      :model-value="modelValue"
      @update="onDesignUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import type { FieldSchema, BlockInstance } from '~/lib/blocks/types'
import FieldText from './fields/FieldText.vue'
import FieldTextarea from './fields/FieldTextarea.vue'
import FieldRichText from './fields/FieldRichText.vue'
import FieldNumber from './fields/FieldNumber.vue'
import FieldColor from './fields/FieldColor.vue'
import FieldBoolean from './fields/FieldBoolean.vue'
import FieldSelect from './fields/FieldSelect.vue'
import FieldAnimation from './fields/FieldAnimation.vue'
import FieldImage from './fields/FieldImage.vue'
import FieldArray from './fields/FieldArray.vue'
import FieldImages from './fields/FieldImages.vue'
import EditorFieldError from './EditorFieldError.vue'
import FieldDesign from './FieldDesign.vue'

const props = defineProps<{
  schema: FieldSchema[]
  modelValue: BlockInstance | null
}>()

const emit = defineEmits<{
  update: [block: BlockInstance]
}>()

const FIELD_MAP: Record<string, any> = {
  text: FieldText,
  textarea: FieldTextarea,
  richtext: FieldRichText,
  number: FieldNumber,
  color: FieldColor,
  boolean: FieldBoolean,
  select: FieldSelect,
  animation: FieldAnimation,
  image: FieldImage,
  array: FieldArray,
  images: FieldImages,
}

function fieldComponent(type: string) {
  return FIELD_MAP[type]
}

function onChange(key: string, value: any) {
  if (!props.modelValue) return
  const updated = {
    ...props.modelValue,
    props: { ...props.modelValue.props, [key]: value },
  }
  emit('update', updated)
}

function onDesignUpdate(block: BlockInstance) {
  emit('update', block)
}
</script>

<style scoped>
.auto-editor { display: flex; flex-direction: column; gap: 14px; }
.auto-field { display: flex; flex-direction: column; gap: 5px; }
.field-label { font-size: 0.78em; color: #9999bb; font-weight: 500; }
</style>
