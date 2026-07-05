<template>
  <ClientOnly>
    <Transition name="panel-slide">
      <div v-if="menuEditorOpen" class="menu-editor-overlay" @click.self="onClose">
        <div class="menu-editor-panel">

          <div class="menu-editor-header">
            <h3>Gestion du menu</h3>
            <div class="menu-editor-header-actions">
              <span v-if="menuChanged" class="unsaved-badge">⚠ Non sauvegardé</span>
              <button class="btn-icon btn-save" @click="saveMenu" :disabled="menuSaving || !menuChanged" title="Sauvegarder">
                {{ menuSaving ? '…' : '💾' }}
              </button>
              <button class="btn-icon" @click="resetToDefault" title="Réinitialiser au menu par défaut">↺</button>
              <button class="btn-icon" @click="onClose" title="Fermer">✕</button>
            </div>
          </div>

          <div class="menu-editor-list">
            <div v-if="loadingPages" class="menu-loading">Chargement…</div>
            <template v-else>
              <div
                v-for="(item, idx) in menuItems"
                :key="item.id"
                class="menu-editor-item"
                :class="{ active: editingMenuItemId === item.id, hidden: !item.visible }"
              >
                <div class="menu-item-row" @click="selectMenuItem(item.id)">
                  <span class="drag-handle" title="Réordonner">⋮⋮</span>
                  <span class="item-type-badge" :class="item.pageSlug ? 'badge-page' : 'badge-link'" :title="item.pageSlug ? 'Page du site' : 'Lien'">
                    {{ item.pageSlug ? '📄' : '🔗' }}
                  </span>
                  <span class="menu-item-label" :class="{ dimmed: !item.visible }">{{ item.label }}</span>
                  <span class="menu-item-to">{{ item.to }}</span>
                  <div class="menu-item-actions" @click.stop>
                    <button
                      :class="['btn-mini', item.visible ? 'btn-eye' : 'btn-eye-off']"
                      @click="toggleMenuItemVisibility(item.id)"
                      :title="item.visible ? 'Masquer du menu' : 'Afficher dans le menu'"
                    >{{ item.visible ? '👁' : '👁‍🗨' }}</button>
                    <button class="btn-mini" @click="moveMenuItem(item.id, -1)" :disabled="idx === 0" title="Monter">↑</button>
                    <button class="btn-mini" @click="moveMenuItem(item.id, 1)" :disabled="idx === menuItems.length - 1" title="Descendre">↓</button>
                    <button v-if="item.pageSlug" class="btn-mini" @click.stop="navigateToPage(item.pageSlug)" title="Ouvrir la page">↗</button>
                    <button class="btn-mini btn-danger" @click.stop="removeItem(item)" title="Supprimer">🗑</button>
                  </div>
                </div>

                <div v-if="editingMenuItemId === item.id" class="menu-item-edit">
                  <label>Libellé affiché</label>
                  <input v-model="editLabel" @input="applyEdit(item.id)" class="input-sm" />
                  <template v-if="!item.pageSlug">
                    <label>Lien (URL ou chemin)</label>
                    <input v-model="editTo" @input="applyEdit(item.id)" class="input-sm" />
                  </template>
                  <template v-else>
                    <p class="page-url-hint">URL : <code>/{{ item.pageSlug }}</code></p>
                  </template>
                  <div v-if="item.children?.length" class="sub-items">
                    <div v-for="sub in item.children" :key="sub.id" class="sub-item">
                      <span>{{ sub.label }}</span>
                      <button class="btn-mini btn-danger" @click="removeMenuItem(sub.id)">🗑</button>
                    </div>
                  </div>
                  <button class="btn-sm" @click="addSubMenuItem(item.id)">+ Ajouter un sous-menu</button>
                </div>
              </div>
            </template>
          </div>

          <div v-if="previewDevice === 'mobile'" class="menu-editor-bg-section">
            <h4>Fond du menu mobile</h4>
            <div class="menu-bg-row">
              <input v-model="bgInput" @input="onBgChange" placeholder="https://exemple.com/image.jpg" class="input-sm" />
              <button v-if="menuBgImage" class="btn-mini" @click="clearBg">✕</button>
            </div>
            <div v-if="menuBgImage" class="menu-bg-preview">
              <img :src="menuBgImage" alt="aperçu fond mobile" />
            </div>
          </div>

          <div class="menu-editor-footer">
            <button class="btn-add btn-add-page" @click="showCreateModal = true" title="Créer une nouvelle page de contenu">
              📄 Créer une page
            </button>
            <button class="btn-add" @click="addMenuItem()" title="Ajouter un lien vers n'importe quelle URL">
              🔗 Ajouter un lien
            </button>
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
                Titre de la page
                <input v-model="newPageTitle" placeholder="ex: Notre équipe" class="admin-mgr-input" @keyup.enter="createPage" autofocus />
              </label>
              <p class="admin-mgr-hint">
                Adresse : <strong>{{ siteUrl }}/{{ titleToSlug(newPageTitle) || '…' }}</strong>
              </p>
            </div>
            <p v-if="createPageError" class="create-page-error">{{ createPageError }}</p>
            <div class="create-page-actions">
              <button class="admin-btn" @click="createPage" :disabled="creatingPage || !newPageTitle.trim()">
                {{ creatingPage ? 'Création…' : 'Créer la page' }}
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
  getFirebaseToken,
  customPages, loadCustomPages,
} = useMenuEditor()

const previewDevice = inject('previewDevice', ref('desktop'))
const router = useRouter()
const route = useRoute()

const editLabel = ref('')
const editTo = ref('')
const bgInput = ref('')
const loadingPages = ref(false)

watch(menuBgImage, (v) => { bgInput.value = v }, { immediate: true })
watch(activeMenuItem, (item) => {
  if (item) { editLabel.value = item.label; editTo.value = item.to }
})

function applyEdit(id) {
  updateMenuItem(id, { label: editLabel.value, to: editTo.value })
}

function onBgChange() { setMenuBgImage(bgInput.value) }
function clearBg() { setMenuBgImage('') }
async function saveMenu() { await saveMenuToFirestore() }

function onClose() {
  if (menuChanged.value) {
    if (!confirm('Modifications non sauvegardées. Quitter quand même ?')) return
  }
  closeMenuEditor()
}

// ── Page management ──────────────────────────────────────────────────

const showCreateModal = ref(false)
const newPageTitle = ref('')
const creatingPage = ref(false)
const createPageError = ref('')
const siteUrl = computed(() => import.meta.client ? window.location.origin : '')

function titleToSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function loadAndMergePages() {
  loadingPages.value = true
  try {
    await loadCustomPages()
    const allPages = customPages.value

    // Tag existing menu items that correspond to a CMS page
    for (const item of menuItems.value) {
      if (!item.pageSlug) {
        const match = allPages.find(p => item.to === `/${p.slug}`)
        if (match) item.pageSlug = match.slug
      }
    }

    // Add orphan CMS pages (exist in D1 but not in menu) as hidden items
    for (const page of allPages) {
      const inMenu = menuItems.value.some(m =>
        m.pageSlug === page.slug ||
        m.to === `/${page.slug}` ||
        m.id === page.slug
      )
      if (!inMenu) {
        menuItems.value.push({
          id: page.slug,
          label: page.title || page.slug,
          to: `/${page.slug}`,
          visible: false,
          pageSlug: page.slug,
          children: [],
        })
      }
    }
  } catch (e) {
    console.warn('MenuEditor: failed to load pages', e)
  } finally {
    loadingPages.value = false
  }
}

async function createPage() {
  const title = newPageTitle.value.trim()
  if (!title) { createPageError.value = 'Titre requis'; return }
  const slug = titleToSlug(title)
  if (!slug) { createPageError.value = 'Titre invalide (impossible de générer une URL)'; return }
  createPageError.value = ''
  creatingPage.value = true
  try {
    const token = await getFirebaseToken()
    if (!token) throw new Error('Non authentifié')
    const res = await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ slug, title }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
    const newItem = { id: slug, label: title, to: `/${slug}`, visible: true, pageSlug: slug, children: [] }
    menuItems.value.push(newItem)
    customPages.value.push({ slug, title })
    menuChanged.value = true
    showCreateModal.value = false
    newPageTitle.value = ''
    await navigateToPage(slug)
  } catch (e) {
    createPageError.value = e.message || 'Erreur lors de la création'
  } finally {
    creatingPage.value = false
  }
}

async function removeItem(item) {
  if (item.pageSlug) {
    if (!confirm(`Supprimer la page « ${item.label} » et la retirer du menu ?`)) return
    const token = await getFirebaseToken()
    if (!token) return
    try {
      const res = await fetch(`/api/pages/${item.pageSlug}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `HTTP ${res.status}`)
      }
    } catch (e) {
      alert(`Erreur : ${e.message}`)
      return
    }
    // Retire immédiatement la page de la liste partagée (dropdown admin) :
    // sans ça elle ne disparaît qu'au prochain rechargement de loadCustomPages()
    customPages.value = customPages.value.filter((p) => p.slug !== item.pageSlug)

    // Si on est en train de visiter/éditer la page supprimée, on n'y reste pas
    // (elle est vide côté serveur désormais) : retour à l'accueil
    const currentPath = route.path.replace(/^\//, '') || 'accueil'
    if (currentPath === item.pageSlug) {
      await navigateToPage('accueil')
    }
  } else {
    if (!confirm(`Retirer « ${item.label} » du menu ?`)) return
  }
  removeMenuItem(item.id)
}

async function navigateToPage(slug) {
  const targetPath = slug === 'accueil' ? '/' : `/${slug}`
  const newQuery = { ...route.query, admin: 'true', device: previewDevice.value }
  if (previewDevice.value !== 'desktop') {
    window.location.href = targetPath + '?' + new URLSearchParams(newQuery).toString()
    return
  }
  try { document.getElementById('app-root')?.classList.add('admin-mode') } catch {}
  try { await router.push({ path: targetPath, query: newQuery }); window.scrollTo(0, 0) }
  catch (err) { console.error('navigateToPage failed', err) }
}

onMounted(() => {
  loadAndMergePages()
})
</script>

<style scoped>
.menu-editor-overlay { position:fixed; inset:0; background:rgba(0,0,0,.3); z-index:10001; display:flex; justify-content:flex-end; }
.menu-editor-panel { width:380px; max-width:100vw; height:100vh; background:#fff; display:flex; flex-direction:column; box-shadow:-4px 0 24px rgba(0,0,0,.2); overflow:hidden; }

.menu-editor-header { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; background:#1a1a2e; color:#fff; flex-shrink:0; }
.menu-editor-header h3 { margin:0; font-size:.95em; font-weight:600; }
.menu-editor-header-actions { display:flex; gap:6px; align-items:center; }
.unsaved-badge { font-size:.7em; color:#fbbf24; white-space:nowrap; }
.btn-icon { background:rgba(255,255,255,.15); border:none; color:#fff; width:30px; height:30px; border-radius:6px; cursor:pointer; font-size:.95em; display:flex; align-items:center; justify-content:center; }
.btn-icon:hover { background:rgba(255,255,255,.25); }
.btn-icon:disabled { opacity:.4; cursor:not-allowed; }

.menu-editor-list { flex:1; overflow-y:auto; padding:8px; }
.menu-loading { padding:24px; text-align:center; color:#999; font-size:.85em; }

.menu-editor-item { border:1px solid #e5e7eb; border-radius:8px; margin-bottom:6px; transition:border-color .15s; }
.menu-editor-item.active { border-color:#3B82F6; box-shadow:0 0 0 2px rgba(59,130,246,.12); }
.menu-editor-item.hidden { opacity:.55; }

.menu-item-row { display:flex; align-items:center; gap:6px; padding:9px 10px; cursor:pointer; border-radius:8px; }
.menu-item-row:hover { background:#f9fafb; }
.drag-handle { color:#ccc; font-size:1em; cursor:grab; user-select:none; flex-shrink:0; }
.item-type-badge { font-size:.8em; flex-shrink:0; opacity:.7; }
.menu-item-label { flex:1; font-size:.88em; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.menu-item-label.dimmed { text-decoration:line-through; color:#999; }
.menu-item-to { font-size:.72em; color:#aaa; max-width:80px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex-shrink:0; }
.menu-item-actions { display:flex; gap:2px; flex-shrink:0; }

.btn-mini { width:26px; height:26px; border:1px solid #e5e7eb; border-radius:4px; background:#fff; cursor:pointer; font-size:.78em; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.btn-mini:hover { background:#f3f4f6; }
.btn-mini:disabled { opacity:.3; cursor:not-allowed; }
.btn-danger:hover { background:#fee; border-color:#EF4B54; }

.menu-item-edit { padding:12px; background:#f9fafb; border-top:1px solid #f0f0f0; border-radius:0 0 8px 8px; }
.menu-item-edit label { display:block; font-size:.72em; font-weight:600; color:#555; margin:8px 0 3px; }
.menu-item-edit label:first-child { margin-top:0; }
.page-url-hint { font-size:.75em; color:#888; margin:6px 0 0; }
.page-url-hint code { background:#eee; padding:1px 5px; border-radius:3px; font-family:monospace; }
.input-sm { width:100%; padding:6px 10px; border:1px solid #ddd; border-radius:6px; font-size:.84em; box-sizing:border-box; }
.input-sm:focus { outline:none; border-color:#3B82F6; }
.sub-items { margin-top:8px; padding:8px; background:#fff; border:1px solid #e5e7eb; border-radius:6px; }
.sub-item { display:flex; align-items:center; justify-content:space-between; padding:4px 0; font-size:.8em; }
.btn-sm { margin-top:8px; padding:5px 12px; background:#3B82F6; color:#fff; border:none; border-radius:6px; font-size:.78em; cursor:pointer; }
.btn-sm:hover { background:#2563eb; }

.menu-editor-bg-section { padding:10px 14px; border-top:1px solid #f0f0f0; flex-shrink:0; }
.menu-editor-bg-section h4 { margin:0 0 7px; font-size:.75em; font-weight:600; color:#777; text-transform:uppercase; letter-spacing:.04em; }
.menu-bg-row { display:flex; gap:6px; align-items:center; }
.menu-bg-preview { margin-top:7px; border-radius:6px; overflow:hidden; }
.menu-bg-preview img { width:100%; max-height:80px; object-fit:cover; border-radius:6px; }

.menu-editor-footer { padding:10px 12px; border-top:1px solid #e5e7eb; display:flex; gap:8px; flex-shrink:0; }
.btn-add { flex:1; padding:9px 10px; background:#f3f4f6; color:#374151; border:2px dashed #d1d5db; border-radius:8px; font-size:.82em; font-weight:600; cursor:pointer; transition:all .15s; }
.btn-add:hover { background:#e0e7ff; border-color:#3B82F6; color:#3B82F6; }
.btn-add-page { background:#f0fdf4; border-color:#bbf7d0; color:#15803d; }
.btn-add-page:hover { background:#dcfce7; border-color:#4ade80; color:#15803d; }

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
.create-page-label { display:flex; flex-direction:column; gap:4px; font-size:.9em; font-weight:600; color:#555; }
.create-page-error { color:#ef4b54; font-size:.8em; margin:8px 0; }
.create-page-actions { margin-top:12px; }
.admin-btn {
  padding:6px 14px; border:none; border-radius:6px; font-size:.85em; font-weight:600;
  cursor:pointer; background:#3b82f6; color:#fff; white-space:nowrap;
}
.admin-btn:hover { background:#2563eb; }
.admin-btn:disabled { opacity:.5; cursor:not-allowed; }
</style>
