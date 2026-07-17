<template>
  <div class="sidebar-autoeditor auto-editor">
    <EditorFieldError
      v-for="field in schema"
      :key="field.key"
      :field-key="field.key"
    >
      <div
        class="auto-field"
        :class="{ 'auto-field-active': activeFieldKey === field.key }"
        :ref="(el) => { if (el) fieldRefs[field.key] = el }"
      >
        <div class="auto-field-header">
          <label class="field-label">{{ field.label }}</label>
          <button
            v-if="isPromotableField(field) && (isPromoted(field) || effectiveFieldValue(field))"
            type="button"
            class="field-promote-btn"
            :title="isPromoted(field) ? 'Déplacer/redimensionner cet élément sur la page' : 'Rendre cet élément déplaçable, redimensionnable et le sortir de sa place fixe dans le bloc'"
            @click="onMoveField(field)"
          >⇱ Déplacer</button>
          <select
            v-if="!isPromoted(field) && isFontableField(field)"
            class="field-font-picker"
            :value="modelValue?.props?.fieldFonts?.[field.key] || ''"
            title="Police de ce champ"
            @change="onFontChange(field.key, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Police par défaut</option>
            <option v-for="f in availableFonts" :key="f.value" :value="f.value">{{ f.label }}</option>
          </select>
        </div>
        <p v-if="isPromoted(field)" class="field-promoted-note">
          ↳ Déplacé sur la page. Clique « Déplacer » ci-dessus pour l'ajuster, ou sélectionne-le sur le bloc pour modifier son contenu.
        </p>
        <component
          v-else
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
import { AVAILABLE_FONTS as availableFonts, fontStack } from '~/utils/fonts.js'
import { watch, nextTick } from 'vue'

const props = defineProps<{
  schema: FieldSchema[]
  modelValue: BlockInstance | null
}>()

const emit = defineEmits<{
  update: [block: BlockInstance]
  promoted: [elementId: string]
}>()

// Champ identifié par le dernier clic direct sur le rendu du bloc (attribut
// data-field-key posé par les composants Block*.vue) — surligné + scrollé en
// vue ci-dessous pour que l'utilisateur retrouve immédiatement dans la
// sidebar l'élément sur lequel il vient de cliquer sur la page.
const { activeFieldKey, identifySeq, promoteFieldToElement } = useAdmin()
const fieldRefs: Record<string, HTMLElement> = {}
// Watch sur identifySeq (compteur incrémenté à CHAQUE clic), pas sur
// activeFieldKey directement : Vue ne déclenche pas un watch sur un ref
// primitif dont la valeur ne change pas (ex: re-cliquer le même champ déjà
// actif) — le scroll ne partait alors jamais pour ce cas précis.
watch(identifySeq, () => {
  const key = activeFieldKey.value
  if (!key) return
  nextTick(() => fieldRefs[key]?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
}, { immediate: true })

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
// bloc (image/texte/HTML) en élément libre du canvas (props.extraElements),
// pour lui donner le même comportement déplacer/redimensionner/éditer
// que les éléments ajoutés via le panneau — au lieu de rester figé à sa
// place dans la mise en page du bloc. richtext rendu via un kind dédié
// (BlockExtraElementContent applique sanitizeHtml + v-html, comme
// BlockRichText.vue) plutôt qu'affiché tel quel comme texte brut.
function isPromotableField(field: FieldSchema) {
  if (!['image', 'text', 'textarea', 'richtext'].includes(field.type)) return false
  return !NON_VISUAL_FIELD_PATTERN.test(field.key)
}

// sidebarBlock (useAdmin.js) expose les props BRUTES, non fusionnées avec
// BLOCK_TYPES[type].defaults comme le fait le rendu public (normalizeBlock) —
// un champ jamais modifié apparaît donc vide ici alors que la page affiche
// bien une valeur par défaut. On retombe sur ce default uniquement pour
// savoir CE QUI EST RÉELLEMENT AFFICHÉ à promouvoir, sans toucher à
// l'affichage des champs eux-mêmes ni au flux de sauvegarde habituel.
function effectiveFieldValue(field: FieldSchema) {
  return effectiveProp(field.key)
}

// Valeur effective d'une prop du bloc : la valeur brute si renseignée,
// sinon le default du type (comme le rendu public via normalizeBlock).
function effectiveProp(key: string) {
  const raw = props.modelValue?.props?.[key]
  if (raw !== undefined && raw !== null && raw !== '') return raw
  const type = props.modelValue?.type
  return type ? BLOCK_TYPES[type]?.defaults?.[key] : undefined
}

function isPromoted(field: FieldSchema) {
  return !!props.modelValue?.props?.promotedFields?.includes(field.key)
}

// Retrouve l'élément déjà promu correspondant à ce champ, pour relancer le
// positionnement dessus sans en recréer un doublon (bouton « Déplacer »
// toujours visible, y compris après une première promotion).
function promotedElementId(field: FieldSchema) {
  return props.modelValue?.props?.extraElements?.find((el) => el.promotedFrom === field.key)?.id || null
}

// Bouton « Déplacer » : promeut le champ s'il ne l'est pas encore, ou
// relance directement le mode positionnement sur l'élément déjà promu.
function onMoveField(field: FieldSchema) {
  if (isPromoted(field)) {
    const id = promotedElementId(field)
    if (id) emit('promoted', id)
    return
  }
  promoteField(field)
}

// Construit l'élément (kind + contenu + apparence héritée), la position/
// taille réelle est mesurée et corrigée par promoteFieldToElement()
// (useAdmin.js — voir ce fichier pour le pourquoi de ce découpage).
function promoteField(field: FieldSchema) {
  if (!props.modelValue) return
  const value = effectiveFieldValue(field)
  if (!value) return
  const kind = field.type === 'image' ? 'image' : field.type === 'richtext' ? 'richtext' : 'text'
  const seed: Partial<ExtraElement> = {
    kind,
    ...(kind === 'image' ? { imageUrl: value, imageAlt: '' } : { text: value }),
  }

  // Reprend l'apparence que le champ avait dans le bloc pour que le texte
  // détaché ne devienne pas un texte générique (couleur/taille/police).
  // Ces clés (textColor/fontSize/fieldFonts) couvrent les blocs textuels du
  // site ; fontSize est en em côté blocs (ex: Bienvenue) → suffixé 'em' si
  // numérique. Un champ sans style particulier reste au défaut de .bee-text.
  if (kind === 'text' || kind === 'richtext') {
    const color = effectiveProp('textColor') ?? effectiveProp('color')
    if (color) seed.color = String(color)
    const fs = effectiveProp('fontSize')
    if (fs !== undefined && fs !== null && fs !== '') {
      seed.fontSize = typeof fs === 'number' ? `${fs}em` : String(fs)
    }
    const align = effectiveProp('textAlign') ?? effectiveProp('align')
    if (align) seed.textAlign = String(align)
    const fontName = props.modelValue.props?.fieldFonts?.[field.key]
    if (fontName && fontStack(fontName)) seed.fontFamily = fontName
  }

  // promoteFieldToElement() lance elle-même le mode positionnement, une
  // fois la taille garantie stable (voir sa doc dans useAdmin.js) — émettre
  // 'promoted' ici déclencherait un positionnement prématuré (sidebar
  // cachée, élément monté) AVANT que la correction de taille n'ait eu lieu.
  promoteFieldToElement(props.modelValue.id, field.key, seed)
}

function onDesignUpdate(block: BlockInstance) {
  emit('update', block)
}
</script>

<style scoped>
.auto-editor { display: flex; flex-direction: column; gap: 14px; }
.auto-field { display: flex; flex-direction: column; gap: 5px; border-radius: 8px; transition: background-color 0.2s, box-shadow 0.2s; }
.auto-field-active { background: rgba(59, 130, 246, 0.08); box-shadow: 0 0 0 2px #3b82f6; padding: 8px; margin: -8px; }
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
.field-promoted-note {
  margin: 0;
  font-size: 0.75em;
  color: #64748b;
  font-style: italic;
  background: #f1f5f9;
  border-radius: 6px;
  padding: 6px 9px;
  line-height: 1.35;
}
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
