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
          <button
            v-if="isPromotableField(field) && effectiveFieldValue(field)"
            type="button"
            class="field-promote-btn"
            title="Rendre cet élément déplaçable, redimensionnable et le sortir de sa place fixe dans le bloc"
            @click="promoteField(field)"
          >⇱ Rendre déplaçable</button>
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
import type { FieldSchema, BlockInstance, ExtraElement } from '~/lib/blocks/types'
import { BLOCK_TYPES } from '~/utils/blockTypes.js'
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
  promoted: [elementId: string]
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

// "Rendre déplaçable" : convertit la valeur actuelle d'un champ fixe du
// bloc (image/texte) en élément libre du canvas (props.extraElements),
// pour lui donner le même comportement déplacer/redimensionner/éditer
// que les éléments ajoutés via le panneau — au lieu de rester figé à sa
// place dans la mise en page du bloc. richtext exclu : son contenu HTML
// serait affiché tel quel comme texte brut par BlockExtraElementContent.
let nextPromotedId = 0
function isPromotableField(field: FieldSchema) {
  if (!['image', 'text', 'textarea'].includes(field.type)) return false
  return !NON_VISUAL_FIELD_PATTERN.test(field.key)
}

// sidebarBlock (useAdmin.js) expose les props BRUTES, non fusionnées avec
// BLOCK_TYPES[type].defaults comme le fait le rendu public (normalizeBlock) —
// un champ jamais modifié apparaît donc vide ici alors que la page affiche
// bien une valeur par défaut. On retombe sur ce default uniquement pour
// savoir CE QUI EST RÉELLEMENT AFFICHÉ à promouvoir, sans toucher à
// l'affichage des champs eux-mêmes ni au flux de sauvegarde habituel.
function effectiveFieldValue(field: FieldSchema) {
  const raw = props.modelValue?.props?.[field.key]
  if (raw !== undefined && raw !== null && raw !== '') return raw
  // Déjà promu : normalizeBlock ne retombera plus sur le default pour ce
  // champ (voir lib/blocks/renderer.ts), donc rien à re-promouvoir ici.
  if (props.modelValue?.props?.promotedFields?.includes(field.key)) return undefined
  const type = props.modelValue?.type
  return type ? BLOCK_TYPES[type]?.defaults?.[field.key] : undefined
}

function promoteField(field: FieldSchema) {
  if (!props.modelValue) return
  const value = effectiveFieldValue(field)
  if (!value) return
  const kind = field.type === 'image' ? 'image' : 'text'
  // Une taille pleine largeur/hauteur (100%) laisse l'élément bloqué :
  // avec :parent="true", un élément qui occupe déjà tout l'espace
  // disponible n'a nulle part où aller tant qu'il n'a pas été réduit —
  // ce qui donnait l'impression qu'un élément promu "ne bougeait pas",
  // contrairement à un élément ajouté (qui démarre à 30%×20%, avec de la
  // marge). Une marge de 5% de chaque côté garde une taille proche de
  // l'original tout en le rendant immédiatement déplaçable. Un léger
  // décalage par élément déjà présent évite en plus que deux champs
  // promus sur le même bloc démarrent parfaitement superposés.
  const existingCount = props.modelValue.props?.extraElements?.length || 0
  const offset = (existingCount % 4) * 3
  const newElement: ExtraElement = {
    id: `el-promoted-${Date.now()}-${nextPromotedId++}`,
    kind,
    xPct: 5 + offset,
    yPct: 5 + offset,
    wPct: 90 - offset,
    hPct: 90 - offset,
    z: existingCount,
    ...(kind === 'image' ? { imageUrl: value, imageAlt: '' } : { text: value }),
  }
  const extraElements = [...(props.modelValue.props?.extraElements || []), newElement]
  const promotedFields = [...new Set([...(props.modelValue.props?.promotedFields || []), field.key])]
  const updated = {
    ...props.modelValue,
    props: { ...props.modelValue.props, [field.key]: '', extraElements, promotedFields },
  }
  emit('update', updated)
  emit('promoted', newElement.id)
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
.field-promote-btn {
  font-size: 0.68em;
  background: #eef4fa;
  border: 1px solid #cfe0ee;
  border-radius: 5px;
  color: #064886;
  padding: 2px 7px;
  cursor: pointer;
  white-space: nowrap;
}
.field-promote-btn:hover { background: #dceafb; }
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
