<template>
  <ClientOnly>
    <Transition name="panel-slide">
      <div v-if="menuEditorOpen" class="menu-editor-overlay" @click.self="onClose">
        <div class="menu-editor-panel">
          <div class="menu-editor-header">
            <h3>📋 Gestion du menu</h3>
            <div class="menu-editor-header-actions">
              <span v-if="menuChanged" class="unsaved-badge">⚠ Non sauvegardé</span>
              <button class="btn-icon btn-save" @click="saveMenu" :disabled="menuSaving || !menuChanged" title="Sauvegarder">
                {{ menuSaving ? '...' : '💾' }}
              </button>
              <button class="btn-icon" @click="resetToDefault" title="Réinitialiser">↺</button>
              <button class="btn-icon" @click="onClose" title="Fermer">✕</button>
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
          <div v-if="previewDevice === 'mobile'" class="menu-editor-bg-section">
            <h4>Fond du menu mobile</h4>
            <div class="menu-bg-row">
              <input v-model="bgInput" @input="onBgChange" placeholder="https://exemple.com/image.jpg" class="input-sm" />
              <button v-if="menuBgImage" class="btn-mini" @click="clearBg">✕</button>
            </div>
            <div v-if="menuBgImage" class="menu-bg-preview">
              <img :src="menuBgImage" alt="aperçu" />
            </div>
          </div>
          <div class="menu-editor-page-section">
            <h4>Pages personnalisées</h4>
            <div v-if="customPages.length" class="menu-pages-list">
              <div v-for="p in customPages" :key="p.slug" class="menu-page-item">
                <span class="menu-page-slug">{{ p.slug }}</span>
              </div>
            </div>
            <p v-else class="menu-pages-empty">Aucune page personnalisée.</p>
            <button class="btn-sm btn-full" @click="showCreateModal = true">+ Créer une page</button>
          </div>
          <div class="menu-editor-footer">
            <button class="btn-add" @click="addMenuItem()">+ Ajouter un lien</button>
          </div>
        </div>
      </div>
    </Transition>
    <!-- Create Page Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="version-modal-overlay" @click.self="showCreateModal = false">
        <div class="version-modal">
          <div class="version-modal-header">
            <h3>Créer une nouvelle page</h3>
            <button class="version-modal-close" @click="showCreateModal = false">✕</button>
          </div>
          <div class="version-modal-body">
            <div class="admin-mgr-section">
              <label class="create-page-label">
                Slug de la page
                <input v-model="newPageSlug" placeholder="ex: notre-equipe" class="admin-mgr-input" @keyup.enter="createPage" />
              </label>
              <p class="admin-mgr-hint">
                Le slug apparaîtra dans l'URL : <strong>{{ siteUrl }}/{{ newPageSlug || 'slug' }}</strong>
              </p>
            </div>
            <p v-if="createPageError" class="create-page-error">{{ createPageError }}</p>
            <div class="create-page-actions">
              <button class="admin-btn" @click="createPage" :disabled="creatingPage || !newPageSlug.trim()">
                {{ creatingPage ? "Création..." : "Créer la page" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    <template #fallback></template>
  </ClientOnly>
</template>

<script setup>
import { ref, watch, inject, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const {
  menuItems, menuEditorOpen, editingMenuItemId, activeMenuItem,
  menuChanged, menuSaving,
  closeMenuEditor, selectMenuItem, updateMenuItem,
  addMenuItem, addSubMenuItem, removeMenuItem,
  moveMenuItem, toggleMenuItemVisibility, resetToDefault,
  menuBgImage, saveMenuToFirestore, setMenuBgImage,
} = useMenuEditor()

const previewDevice = inject('previewDevice', ref('desktop'))
const router = useRouter()
const route = useRoute()

const editLabel = ref('')
const editTo = ref('')
const bgInput = ref('')

watch(menuBgImage, (v) => { bgInput.value = v }, { immediate: true })
watch(activeMenuItem, (item) => {
  if (item) { editLabel.value = item.label; editTo.value = item.to }
})

function applyEdit(id) {
  updateMenuItem(id, { label: editLabel.value, to: editTo.value })
}

function onBgChange() {
  setMenuBgImage(bgInput.value)
}

function clearBg() {
  setMenuBgImage('')
}

async function saveMenu() {
  await saveMenuToFirestore()
}

function onClose() {
  if (menuChanged.value) {
    const answer = confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter sans sauvegarder ?')
    if (!answer) return
  }
  closeMenuEditor()
}

// Page creation
const customPages = ref([])
const showCreateModal = ref(false)
const newPageSlug = ref('')
const creatingPage = ref(false)
const createPageError = ref('')
const siteUrl = computed(() => import.meta.client ? window.location.origin : '')

async function getFirebaseToken() {
  const { $auth } = useNuxtApp()
  const user = await new Promise((resolve) => {
    if (!$auth?.currentUser) {
      const unsub = $auth?.onAuthStateChanged((u) => { resolve(u); if (typeof unsub === 'function') unsub() })
    } else {
      resolve($auth.currentUser)
    }
  })
  if (!user) return null
  try { return await user.getIdToken() } catch { return null }
}

async function createPage() {
  const slug = newPageSlug.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '')
  if (!slug) {
    createPageError.value = 'Veuillez entrer un slug valide (lettres, chiffres, tirets)'
    return
  }
  createPageError.value = ''
  creatingPage.value = true
  try {
    const token = await getFirebaseToken()
    if (!token) throw new Error('Non authentifié')
    const res = await fetch('/api/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ slug }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
    showCreateModal.value = false
    newPageSlug.value = ''
    loadCustomPages()
    await navigateToPage(slug)
  } catch (e) {
    createPageError.value = e.message || 'Erreur lors de la création'
  } finally {
    creatingPage.value = false
  }
}

async function navigateToPage(slug) {
  const targetPath = slug === "accueil" ? "/" : `/${slug}`
  const newQuery = { ...route.query, admin: "true", device: previewDevice.value }
  if (previewDevice.value !== "desktop") {
    window.location.href = targetPath + "?" + new URLSearchParams(newQuery).toString()
    return
  }
  try {
    document.getElementById("app-root")?.classList.add("admin-mode")
  } catch (e) { console.warn(e) }
  try {
    await router.push({ path: targetPath, query: newQuery })
    window.scrollTo(0, 0)
  } catch (err) {
    console.error("navigateToPage failed", err)
  }
}

function loadCustomPages() {
  fetch('/api/pages')
    .then(res => res.json())
    .then(data => {
      const hardcoded = ['accueil', 'contact', 'messages', 'event-list', 'agenda']
      customPages.value = (data.pages || []).filter(p => !hardcoded.includes(p.slug))
    })
    .catch(() => { customPages.value = [] })
}

onMounted(() => {
  loadCustomPages()
})
</script>

<style scoped>
.menu-editor-overlay { position:fixed; inset:0; background:rgba(0,0,0,.3); z-index:10001; display:flex; justify-content:flex-end; }
.menu-editor-panel { width:380px; max-width:100vw; height:100vh; background:#fff; display:flex; flex-direction:column; box-shadow:-4px 0 24px rgba(0,0,0,.2); }
.menu-editor-header { display:flex; align-items:center; justify-content:space-between; padding:16px; background:#1a1a2e; color:#fff; }
.menu-editor-header h3 { margin:0; font-size:1em; }
.menu-editor-header-actions { display:flex; gap:6px; align-items:center; }
.unsaved-badge { font-size:.7em; color:#fbbf24; white-space:nowrap; }
.btn-icon { background:rgba(255,255,255,.15); border:none; color:#fff; width:32px; height:32px; border-radius:6px; cursor:pointer; font-size:1em; display:flex; align-items:center; justify-content:center; }
.btn-icon:hover { background:rgba(255,255,255,.25); }
.btn-icon:disabled { opacity:.4; cursor:not-allowed; }
.btn-save { font-size:1.1em; }
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
.input-sm { width:100%; padding:6px 10px; border:1px solid #ddd; border-radius:6px; font-size:.85em; box-sizing:border-box; }
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
.menu-editor-page-section { padding:12px 16px; border-top:1px solid #e5e7eb; }
.menu-editor-page-section h4 { margin:0 0 8px; font-size:.8em; font-weight:600; color:#555; }
.menu-pages-list { display:flex; flex-direction:column; gap:4px; margin-bottom:8px; }
.menu-page-item { display:flex; align-items:center; justify-content:space-between; padding:4px 8px; background:#f9fafb; border-radius:4px; font-size:.8em; }
.menu-page-slug { color:#555; font-family:monospace; font-size:.9em; }
.menu-pages-empty { font-size:.78em; color:#aaa; margin:0 0 8px; }
.btn-full { width:100%; margin-top:0; }
.panel-slide-enter-active,.panel-slide-leave-active { transition:opacity .2s; }
.panel-slide-enter-active .menu-editor-panel,.panel-slide-leave-active .menu-editor-panel { transition:transform .25s ease; }
.panel-slide-enter-from { opacity:0; }
.panel-slide-enter-from .menu-editor-panel { transform:translateX(100%); }
.panel-slide-leave-to { opacity:0; }
.panel-slide-leave-to .menu-editor-panel { transform:translateX(100%); }
</style>

<style>
.version-modal-overlay {
  position: fixed; top:0; left:0; right:0; bottom:0;
  background:rgba(0,0,0,.5); z-index:99999;
  display:flex; align-items:center; justify-content:center;
}
.version-modal {
  background:#fff; border-radius:12px; width:90%; max-width:500px; max-height:80vh;
  display:flex; flex-direction:column; box-shadow:0 8px 40px rgba(0,0,0,.2);
}
.version-modal-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 20px; border-bottom:1px solid #eee;
}
.version-modal-header h3 { margin:0; font-size:16px; color:#333; }
.version-modal-close {
  background:none; border:none; font-size:20px; cursor:pointer; color:#999; padding:4px 8px;
}
.version-modal-close:hover { color:#333; }
.version-modal-body { padding:16px 20px; overflow-y:auto; flex:1; }
.admin-mgr-section { margin-bottom:16px; }
.admin-mgr-section label { display:block; font-size:.9em; font-weight:600; color:#555; margin-bottom:6px; }
.admin-mgr-input {
  width:100%; padding:8px 12px; border:1px solid #ddd; border-radius:6px; font-size:13px; box-sizing:border-box;
}
.admin-mgr-hint { font-size:12px; color:#999; margin:6px 0 0; }
.create-page-error { color:#ef4b54; font-size:.8em; margin:8px 0; }
.create-page-actions { margin-top:12px; }
.admin-btn {
  padding:6px 14px; border:none; border-radius:6px; font-size:.85em; font-weight:600;
  cursor:pointer; background:#3b82f6; color:#fff; white-space:nowrap;
}
.admin-btn:hover { background:#2563eb; }
.admin-btn:disabled { opacity:.5; cursor:not-allowed; }
</style>
