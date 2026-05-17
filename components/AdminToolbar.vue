<template>
  <div class="admin-toolbar">
    <div class="admin-toolbar-left">
      <span class="admin-badge">Mode édition</span>
      <span class="admin-page-label">{{ pageSlug }}</span>
    </div>
    <div class="admin-toolbar-center" v-if="activeBlock">
      <span class="admin-block-type">{{ getBlockLabel(activeBlock.type) }}</span>
    </div>
    <div class="admin-toolbar-right">
      <button class="admin-btn" @click="saveChanges" :disabled="saving">
        {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
      </button>
      <button class="admin-btn admin-btn-secondary" @click="exitAdmin">
        Quitter
      </button>
    </div>
  </div>

  <div class="admin-sidebar" v-if="activeBlock">
    <div class="admin-sidebar-header">
      <h3>{{ getBlockLabel(activeBlock.type) }}</h3>
      <button class="admin-close-btn" @click="selectBlock(null)">✕</button>
    </div>
    <div class="admin-sidebar-body">
      <div
        v-for="field in getBlockSchema(activeBlock.type)"
        :key="field.key"
        class="admin-field"
      >
        <label>{{ field.label }}</label>
        <input
          v-if="field.type === 'text' || field.type === 'color' || field.type === 'image'"
          :type="field.type === 'color' ? 'color' : 'text'"
          :value="getPropValue(field.key)"
          @input="setPropValue(field.key, $event.target.value)"
          class="admin-input"
        />
        <textarea
          v-else-if="field.type === 'textarea' || field.type === 'richtext'"
          :value="getPropValue(field.key)"
          @input="setPropValue(field.key, $event.target.value)"
          class="admin-input admin-textarea"
          rows="4"
        />
        <select
          v-else-if="field.type === 'select'"
          :value="getPropValue(field.key)"
          @change="setPropValue(field.key, $event.target.value)"
          class="admin-input"
        >
          <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <label v-else-if="field.type === 'boolean'" class="admin-checkbox">
          <input
            type="checkbox"
            :checked="getPropValue(field.key)"
            @change="setPropValue(field.key, $event.target.checked)"
          />
          <span>{{ field.label }}</span>
        </label>
        <input
          v-else-if="field.type === 'number'"
          type="number"
          :min="field.min"
          :max="field.max"
          :value="getPropValue(field.key)"
          @input="setPropValue(field.key, parseInt($event.target.value))"
          class="admin-input"
        />
        <span v-else class="admin-unsupported">Type "{{ field.type }}" non supporté</span>
      </div>
    </div>
    <div class="admin-sidebar-footer">
      <div class="admin-block-actions">
        <button class="admin-action-btn" @click="moveBlock(activeBlock.id, -1)" title="Monter">↑</button>
        <button class="admin-action-btn" @click="moveBlock(activeBlock.id, 1)" title="Descendre">↓</button>
        <button class="admin-action-btn admin-action-danger" @click="removeBlock(activeBlock.id)" title="Supprimer">🗑</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BLOCK_TYPES } from '~/utils/blockTypes.js'

const props = defineProps({
  pageSlug: { type: String, default: '' },
})

const emit = defineEmits(['save', 'exit'])

const {
  activeBlock,
  selectBlock,
  updateBlock,
  moveBlock,
  removeBlock,
  exitAdmin,
} = useAdmin()

const saving = ref(false)

function getBlockLabel(type) {
  return BLOCK_TYPES[type]?.label || type
}

function getBlockSchema(type) {
  return BLOCK_TYPES[type]?.schema || []
}

function getPropValue(key) {
  if (!activeBlock.value) return ''
  return activeBlock.value.props?.[key] ?? ''
}

function setPropValue(key, value) {
  if (!activeBlock.value) return
  updateBlock(activeBlock.value.id, { [key]: value })
}

async function saveChanges() {
  saving.value = true
  try {
    const { doc, setDoc } = await import('firebase/firestore')
    const { $db } = useNuxtApp()
    const blocks = useAdmin().getBlocks()
    await setDoc(doc($db, 'pages', props.pageSlug), { blocks })
    alert('Page sauvegardée !')
  } catch (e) {
    console.error('Save error:', e)
    alert('Erreur lors de la sauvegarde : ' + e.message)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.admin-toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: #1a1a2e;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 10000;
  gap: 16px;
}
.admin-toolbar-left, .admin-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.admin-toolbar-center {
  flex: 1;
  text-align: center;
}
.admin-badge {
  background: #EF4B54;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: 700;
}
.admin-page-label {
  font-size: 0.85em;
  opacity: 0.7;
}
.admin-block-type {
  font-size: 0.9em;
  font-weight: 600;
}
.admin-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.85em;
  font-weight: 600;
  cursor: pointer;
  background: #3B82F6;
  color: white;
}
.admin-btn:hover { background: #2563eb; }
.admin-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.admin-btn-secondary {
  background: rgba(255,255,255,0.15);
}
.admin-btn-secondary:hover { background: rgba(255,255,255,0.25); }

.admin-sidebar {
  position: fixed;
  top: 48px;
  right: 0;
  bottom: 0;
  width: 320px;
  background: white;
  box-shadow: -4px 0 20px rgba(0,0,0,0.15);
  z-index: 9999;
  display: flex;
  flex-direction: column;
}
.admin-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
}
.admin-sidebar-header h3 {
  margin: 0;
  font-size: 1em;
  color: #1a1a2e;
}
.admin-close-btn {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  color: #888;
  padding: 4px 8px;
}
.admin-close-btn:hover { color: #333; }
.admin-sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.admin-field {
  margin-bottom: 16px;
}
.admin-field label {
  display: block;
  font-size: 0.8em;
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
}
.admin-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9em;
  font-family: inherit;
}
.admin-input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
}
.admin-textarea {
  resize: vertical;
  min-height: 80px;
}
.admin-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.admin-checkbox input {
  width: 18px;
  height: 18px;
  accent-color: #3B82F6;
}
.admin-unsupported {
  font-size: 0.8em;
  color: #888;
  font-style: italic;
}
.admin-sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid #eee;
}
.admin-block-actions {
  display: flex;
  gap: 8px;
}
.admin-action-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 1em;
}
.admin-action-btn:hover { background: #f5f5f5; }
.admin-action-danger:hover { background: #fee; border-color: #EF4B54; }
</style>
