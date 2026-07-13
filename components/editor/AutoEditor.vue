<template>
  <div class="sidebar-autoeditor auto-editor">
    <EditorFieldError
      v-for="field in schema"
      :key="field.key"
      :field-key="field.key"
    >
      <div class="auto-field">
        <div class="auto-field-header">
          <label class="field-label">{{ field.label }}</label>
          <select
            v-if="isFontableField(field)"
            class="field-font-picker"
            :value="modelValue?.props?.fieldFonts?.[field.key] || ''"
            title="Police de ce champ"
            @change="onFontChange(field.key, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Police par défaut</option>
            <option v-for="f in availableFonts" :key="f.value" :value="f.value">{{ f.label }}</option>
          </select>
        </div>
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
import { AVAILABLE_FONTS as availableFonts } from '~/utils/fonts.js'

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

// Champs texte simples uniquement (pas array/richtext sous-champs) — la
// police par champ ne descend pas dans les items d'un tableau (activités,
// FAQ...), portée volontairement limitée aux champs de premier niveau.
// Exclut aussi les champs "text" qui ne sont pas du texte visuel affiché
// (liens, URLs, CSS de gradient, ID vidéo) via une convention de nommage —
// pas de sens à proposer une police pour une URL ou un identifiant.
const NON_VISUAL_FIELD_PATTERN = /link|url|gradient|videoid|^alt$/i
function isFontableField(field: FieldSchema) {
  if (!['text', 'textarea', 'richtext'].includes(field.type)) return false
  return !NON_VISUAL_FIELD_PATTERN.test(field.key)
}

function onChange(key: string, value: any) {
  if (!props.modelValue) return
  const updated = {
    ...props.modelValue,
    props: { ...props.modelValue.props, [key]: value },
  }
  emit('update', updated)
}

function onFontChange(key: string, font: string) {
  if (!props.modelValue) return
  const fieldFonts = { ...(props.modelValue.props?.fieldFonts || {}) }
  if (font) fieldFonts[key] = font
  else delete fieldFonts[key]
  const updated = {
    ...props.modelValue,
    props: { ...props.modelValue.props, fieldFonts },
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
.auto-field-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.field-label { font-size: 0.78em; color: #6b7280; font-weight: 500; }
.field-font-picker {
  font-size: 0.72em;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  color: #555;
  padding: 2px 5px;
  max-width: 130px;
}
</style>
