<template>
  <ClientOnly>
    <Transition name="panel-slide">
      <div v-if="menuEditorOpen" class="menu-editor-overlay" @click.self="closeMenuEditor">
        <div class="menu-editor-panel">
          <div class="menu-editor-header">
            <h3>📋 Gestion du menu</h3>
            <div class="menu-editor-header-actions">
              <button class="btn-icon" @click="resetToDefault" title="Réinitialiser">↺</button>
              <button class="btn-icon" @click="closeMenuEditor" title="Fermer">✕</button>
            </div>
          </div>
          <div class="menu-editor-hint">
            En mode édition, les liens du menu sont éditables. Cliquez sur un item pour le modifier.
          </div>
          <div class="menu-editor-list">
            <div v-for="(item, idx) in menuItems" :key="item.id"
              class="menu-editor-item" :class="{ active: editingMenuItemId === item.id, hidden: !item.visible }">
              <div class="menu-item-row" @click="selectMenuItem(item.id)">
                <span class="drag-handle">⋮⋮</span>
                <span class="menu-item-label" :class="{ dimmed: !item.visible }">{{ item.label }}</span>
                <span class="menu-item-to">{{ item.to }}</span>
                <div class="menu-item-actions" @click.stop>
                  <button :class="['btn-mini', item.visible ? 'btn-eye' : 'btn-eye-off']"
                    @click="toggleMenuItemVisibility(item.id)">{{ item.visible ? '👁' : '👁‍🗨' }}</button>
                  <button class="btn-mini" @click="moveMenuItem(item.id, -1)" :disabled="idx===0">↑</button>
                  <button class="btn-mini" @click="moveMenuItem(item.id, 1)" :disabled="idx===menuItems.length-1">↓</button>
                  <button class="btn-mini btn-danger" @click="removeMenuItem(item.id)">🗑</button>
                </div>
              </div>
              <div v-if="editingMenuItemId === item.id" class="menu-item-edit">
                <label>Libellé</label>
                <input v-model="editLabel" @input="applyEdit(item.id)" class="input-sm" />
                <label>Lien (URL ou chemin)</label>
                <input v-model="editTo" @input="applyEdit(item.id)" class="input-sm" />
                <div v-if="item.children?.length" class="sub-items">
                  <div v-for="sub in item.children" :key="sub.id" class="sub-item">
                    <span>{{ sub.label }}</span>
                    <button class="btn-mini btn-danger" @click="removeMenuItem(sub.id)">🗑</button>
                  </div>
                </div>
                <button class="btn-sm" @click="addSubMenuItem(item.id)">+ Ajouter un sous-menu</button>
              </div>
            </div>
          </div>
          <div class="menu-editor-bg-section">
            <h4>Fond du menu mobile</h4>
            <div class="menu-bg-row">
              <input v-model="bgImage" placeholder="https://exemple.com/image.jpg" class="input-sm" @input="updateBg" />
              <button v-if="bgImage" class="btn-mini" @click="clearBg">✕</button>
            </div>
            <div v-if="bgImage" class="menu-bg-preview">
              <img :src="bgImage" alt="aperçu" />
            </div>
          </div>
          <div class="menu-editor-footer">
            <button class="btn-add" @click="addMenuItem()">+ Ajouter un lien</button>
          </div>
        </div>
      </div>
    </Transition>
    <template #fallback></template>
  </ClientOnly>
</template>

<script setup>
import { ref, watch } from 'vue'

const {
  menuItems, menuEditorOpen, editingMenuItemId, activeMenuItem,
  closeMenuEditor, selectMenuItem, updateMenuItem,
  addMenuItem, addSubMenuItem, removeMenuItem,
  moveMenuItem, toggleMenuItemVisibility, resetToDefault,
} = useMenuEditor()

const editLabel = ref('')
const editTo = ref('')

const bgImage = ref(menuBgImage.value || '')
function updateBg() { menuBgImage.value = bgImage.value }
function clearBg() { bgImage.value = ''; menuBgImage.value = '' }

watch(activeMenuItem, (item) => {
  if (item) { editLabel.value = item.label; editTo.value = item.to }
})

function applyEdit(id) {
  updateMenuItem(id, { label: editLabel.value, to: editTo.value })
}
</script>

<style scoped>
.menu-editor-overlay { position:fixed; inset:0; background:rgba(0,0,0,.3); z-index:10001; display:flex; justify-content:flex-end; }
.menu-editor-panel { width:380px; max-width:100vw; height:100vh; background:#fff; display:flex; flex-direction:column; box-shadow:-4px 0 24px rgba(0,0,0,.2); }
.menu-editor-header { display:flex; align-items:center; justify-content:space-between; padding:16px; background:#1a1a2e; color:#fff; }
.menu-editor-header h3 { margin:0; font-size:1em; }
.menu-editor-header-actions { display:flex; gap:8px; }
.btn-icon { background:rgba(255,255,255,.15); border:none; color:#fff; width:32px; height:32px; border-radius:6px; cursor:pointer; font-size:1em; }
.btn-icon:hover { background:rgba(255,255,255,.25); }
.menu-editor-hint { padding:12px 16px; background:#f0f4ff; color:#3B82F6; font-size:.8em; border-bottom:1px solid #e0e7ff; }
.menu-editor-list { flex:1; overflow-y:auto; padding:8px; }
.menu-editor-item { border:1px solid #e5e7eb; border-radius:8px; margin-bottom:6px; transition:all .15s; }
.menu-editor-item.active { border-color:#3B82F6; box-shadow:0 0 0 2px rgba(59,130,246,.15); }
.menu-editor-item.hidden { opacity:.5; }
.menu-item-row { display:flex; align-items:center; gap:8px; padding:10px 12px; cursor:pointer; }
.menu-item-row:hover { background:#f9fafb; }
.drag-handle { color:#ccc; font-size:1em; cursor:grab; user-select:none; }
.menu-item-label { flex:1; font-size:.9em; font-weight:500; }
.menu-item-label.dimmed { text-decoration:line-through; color:#999; }
.menu-item-to { font-size:.75em; color:#888; max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.menu-item-actions { display:flex; gap:2px; }
.btn-mini { width:28px; height:28px; border:1px solid #e5e7eb; border-radius:4px; background:#fff; cursor:pointer; font-size:.8em; display:flex; align-items:center; justify-content:center; }
.btn-mini:hover { background:#f3f4f6; }
.btn-mini:disabled { opacity:.3; cursor:not-allowed; }
.btn-danger:hover { background:#fee; border-color:#EF4B54; }
.menu-item-edit { padding:12px; background:#f9fafb; border-top:1px solid #e5e7eb; }
.menu-item-edit label { display:block; font-size:.75em; font-weight:600; color:#555; margin:8px 0 4px; }
.menu-item-edit label:first-child { margin-top:0; }
.input-sm { width:100%; padding:6px 10px; border:1px solid #ddd; border-radius:6px; font-size:.85em; }
.input-sm:focus { outline:none; border-color:#3B82F6; }
.sub-items { margin-top:8px; padding:8px; background:#fff; border:1px solid #e5e7eb; border-radius:6px; }
.sub-item { display:flex; align-items:center; justify-content:space-between; padding:4px 0; font-size:.8em; }
.btn-sm { margin-top:8px; padding:6px 14px; background:#3B82F6; color:#fff; border:none; border-radius:6px; font-size:.8em; cursor:pointer; }
.btn-sm:hover { background:#2563eb; }
.menu-editor-footer { padding:12px 16px; border-top:1px solid #e5e7eb; }
.btn-add { width:100%; padding:10px; background:#f3f4f6; color:#3B82F6; border:2px dashed #3B82F6; border-radius:8px; font-size:.9em; font-weight:600; cursor:pointer; }
.btn-add:hover { background:#e0e7ff; }
.menu-editor-bg-section { padding:12px 16px; border-top:1px solid #e5e7eb; }
.menu-editor-bg-section h4 { margin:0 0 8px; font-size:.8em; font-weight:600; color:#555; }
.menu-bg-row { display:flex; gap:6px; align-items:center; }
.menu-bg-preview { margin-top:8px; border-radius:6px; overflow:hidden; }
.menu-bg-preview img { width:100%; max-height:120px; object-fit:cover; border-radius:6px; }
.panel-slide-enter-active,.panel-slide-leave-active { transition:opacity .2s; }
.panel-slide-enter-active .menu-editor-panel,.panel-slide-leave-active .menu-editor-panel { transition:transform .25s ease; }
.panel-slide-enter-from { opacity:0; }
.panel-slide-enter-from .menu-editor-panel { transform:translateX(100%); }
.panel-slide-leave-to { opacity:0; }
.panel-slide-leave-to .menu-editor-panel { transform:translateX(100%); }
</style>
