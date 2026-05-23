<template>
  <div class="admin-toolbar">
    <div class="admin-toolbar-left">
      <span class="admin-badge">Mode édition</span>
      <select class="admin-page-select" :value="pageSlug" @change="navigateToPage($event.target.value)">
        <option value="accueil">Accueil</option>
        <option value="photos">Photos</option>
        <option value="contact">Contact</option>
        <option value="messages">Messages</option>
        <option value="billetterie">Billetterie</option>
        <option value="agenda">Agenda</option>
      </select>
    </div>
    <div class="admin-toolbar-center">
      <div class="device-toggle" v-if="activeBlock">
        <span class="admin-block-type">{{ getBlockLabel(activeBlock.type) }}</span>
      </div>
      <div class="device-toggle" v-else>
        <button
          class="device-btn"
          :class="{ active: previewDevice === 'desktop' }"
          @click="previewDevice = 'desktop'"
          title="Desktop"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="17"/></svg>
        </button>
        <button
          class="device-btn"
          :class="{ active: previewDevice === 'tablet' }"
          @click="previewDevice = 'tablet'"
          title="Tablet"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
        </button>
        <button
          class="device-btn"
          :class="{ active: previewDevice === 'mobile' }"
          @click="previewDevice = 'mobile'"
          title="Mobile"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="admin-toolbar-right">
      <ClientOnly>
        <template v-if="user">
          <span class="admin-user">{{ user.email }}</span>
          <button class="admin-btn" @click="saveChanges" :disabled="saving">
            {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
          </button>
          <button class="admin-btn admin-btn-secondary" @click="signOutAndExit">
            Quitter
          </button>
        </template>
        <template v-else>
          <button class="admin-btn admin-btn-login" @click="signInWithGoogle">
            Se connecter
          </button>
          <button class="admin-btn admin-btn-secondary" @click="exitAdmin">
            ✕
          </button>
        </template>
        <template #fallback>
          <span class="admin-loading">Chargement...</span>
        </template>
      </ClientOnly>
    </div>
  </div>

  <div class="admin-sidebar-overlay" v-if="activeBlock && user" @click="selectBlock(null)"></div>
  <div class="admin-sidebar" v-if="activeBlock && user">
    <div class="admin-sidebar-header">
      <h3>{{ getBlockLabel(activeBlock.type) }}</h3>
      <button class="admin-close-btn" @click="selectBlock(null)">✕</button>
    </div>
    <div v-if="activeBlock && user" style="padding:0 16px 12px; border-bottom:1px solid #eee; display:flex; gap:8px; align-items:center;">
      <button class="admin-btn" @click.prevent="replayAnimation(activeBlock.id)">Rejouer l'animation</button>
      <small style="color:#666; font-size:0.88em;">Si l'animation est scroll-driven, je scrollerai vers le bloc.</small>
    </div>
    <div class="admin-sidebar-body">
        <div
          v-for="field in getBlockSchema(activeBlock.type)"
          :key="field.key"
          class="admin-field"
        >
          <label>{{ field.label }}</label>
          <input
            v-if="field.type === 'text' || field.type === 'color'"
            :type="field.type === 'color' ? 'color' : 'text'"
            :value="getPropValue(field.key)"
            @input="setPropValue(field.key, $event.target.value)"
            class="admin-input"
          />
          <div v-else-if="field.type === 'image'" class="admin-image-field">
            <input
              type="text"
              class="admin-input"
              placeholder="/chemin/image.jpg"
              :value="getPropValue(field.key)"
              @input="setPropValue(field.key, $event.target.value)"
            />
            <div class="uploader-controls">
              <input ref="adminFileInput" type="file" accept="image/*" class="file-input" @change="onAdminFileSelected" />
              <button class="admin-btn" @click.prevent="triggerAdminFileSelect(field.key)">Téléverser</button>
              <button v-if="uploadedImages.length" class="admin-btn admin-btn-secondary" @click.prevent="toggleAdminImagesList(field.key)">Images uploadées ({{ uploadedImages.length }})</button>
            </div>
            <img v-if="getPropValue(field.key)" :src="getPropValue(field.key)" class="admin-image-preview" />
            <div v-if="showAdminImagesList" class="admin-uploaded-list">
              <div v-if="imagesLoading" class="images-loading">Chargement...</div>
              <div v-else class="admin-uploaded-grid">
                <div v-for="(u, i) in uploadedImages" :key="i" class="admin-uploaded-item">
                  <img :src="u" @click="selectAdminUploaded(u, field.key)" alt="img" />
                </div>
              </div>
            </div>
          </div>
        <textarea
          v-else-if="field.type === 'textarea' || field.type === 'richtext'"
          :value="getPropValue(field.key)"
          @input="setPropValue(field.key, $event.target.value)"
          class="admin-input admin-textarea"
          rows="4"
        />
        <select
          v-else-if="field.type === 'select' || field.type === 'animation'"
          :value="getPropValue(field.key)"
          @change="setPropValue(field.key, $event.target.value)"
          class="admin-input"
        >
          <option v-for="opt in (field.type === 'animation' ? ANIMATIONS : field.options)" :key="opt.id || opt" :value="opt.id || opt">{{ opt.label || opt }}</option>
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
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { BLOCK_TYPES, ANIMATIONS } from '~/utils/blockTypes.js'

const props = defineProps({
  pageSlug: { type: String, default: '' },
})

const router = useRouter()
const route = useRoute()

const {
  isAdminMode,
  activeBlock,
  selectBlock,
  updateBlock,
  moveBlock,
  removeBlock,
  exitAdmin,
  localBlocks,
  previewDevice,
} = useAdmin()

const { $auth } = useNuxtApp()
const user = ref(null)
const saving = ref(false)

// Image uploader state for admin sidebar
const adminFileInput = ref(null)
const uploadedImages = ref([])
const showAdminImagesList = ref(false)
const imagesLoading = ref(false)
const currentAdminImageKey = ref('')

let unsubscribe = null

onMounted(() => {
  unsubscribe = onAuthStateChanged($auth, (u) => {
    user.value = u
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

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

function triggerAdminFileSelect(key) {
  currentAdminImageKey.value = key
  if (adminFileInput.value) adminFileInput.value.click()
}

async function onAdminFileSelected(e) {
  const file = e.target.files && e.target.files[0]
  if (!file || !import.meta.client) return
  imagesLoading.value = true
  try {
    const { getStorage, ref: storageRef, uploadBytes, getDownloadURL } = await import('firebase/storage')
    const storage = getStorage()
    const path = `uploads/${Date.now()}_${file.name}`
    const r = storageRef(storage, path)
    await uploadBytes(r, file)
    const url = await getDownloadURL(r)
    if (currentAdminImageKey.value) setPropValue(currentAdminImageKey.value, url)
    await loadAdminUploadedImages()
  } catch (err) {
    console.error('Upload error', err)
    alert('Erreur lors du téléversement : ' + (err.message || err))
  } finally {
    imagesLoading.value = false
  }
}

async function loadAdminUploadedImages() {
  if (!import.meta.client) return
  imagesLoading.value = true
  try {
    const { getStorage, ref: storageRef, listAll, getDownloadURL } = await import('firebase/storage')
    const storage = getStorage()
    const listRef = storageRef(storage, 'uploads')
    const res = await listAll(listRef)
    const urls = await Promise.all(res.items.map(i => getDownloadURL(i)))
    uploadedImages.value = urls
  } catch (err) {
    console.error('Error loading images', err)
    uploadedImages.value = []
  } finally {
    imagesLoading.value = false
  }
}

function toggleAdminImagesList(key) {
  if (key) currentAdminImageKey.value = key
  showAdminImagesList.value = !showAdminImagesList.value
  if (showAdminImagesList.value) loadAdminUploadedImages()
}

function selectAdminUploaded(url, key) {
  setPropValue(key, url)
  showAdminImagesList.value = false
}

function replayAnimation(blockId) {
  // dispatch global event handled by PageRenderer
  try {
    document.dispatchEvent(new CustomEvent('replay-animation', { detail: { id: blockId } }))
  } catch (e) {}
}

async function navigateToPage(slug) {
  // Use client-side navigation so the admin layout/offset is preserved
  const targetPath = slug === 'accueil' ? '/' : `/${slug}`
  const currentPath = route.path || window.location.pathname
  const currentAdmin = route.query?.admin === 'true' || route.query?.admin === '1'

  // If already on the same path and admin param is set, skip navigation
  if (currentPath === targetPath && currentAdmin) {
    console.debug('navigateToPage: already on target with admin — no navigation', targetPath)
    return
  }
  console.debug('navigateToPage:', { slug, targetPath, currentPath, routeQuery: route.query, isAdminMode: isAdminMode?.value })

  const newQuery = { ...route.query, admin: 'true' }
  // Always do client-side navigation to preserve admin-mode layout and offsets
  // Ensure admin mode is applied immediately so layout (header spacer) updates
  try {
    if (isAdminMode) isAdminMode.value = true
    const root = document.getElementById('app-root') || document.getElementById('__nuxt')
    if (root && !root.classList.contains('admin-mode')) root.classList.add('admin-mode')
  } catch (e) {
    console.warn('navigateToPage: could not set admin-mode class', e)
  }

  try {
    await router.push({ path: targetPath, query: newQuery })
    try { window.scrollTo(0, 0) } catch (e) {}
    console.debug('navigateToPage: navigation done to', targetPath)
  } catch (err) {
    console.error('navigateToPage: router.push failed', err)
  }
}

async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  try {
    await signInWithPopup($auth, provider)
  } catch (e) {
    console.error('Login error:', e)
    alert('Connexion échouée : ' + e.message)
  }
}

async function signOutAndExit() {
  try {
    await signOut($auth)
  } catch (e) {
    console.error('Sign out error:', e)
  }
  exitAdmin()
}

async function saveChanges() {
  if (!user.value) {
    alert('Connectez-vous pour sauvegarder.')
    return
  }
  saving.value = true
  try {
    const { doc, setDoc } = await import('firebase/firestore')
    const { $db } = useNuxtApp()
    const blocks = localBlocks.value
    await setDoc(doc($db, 'pages', props.pageSlug), { blocks })
    // Also persist menu changes
    const { saveMenuToFirestore } = useMenuEditor()
    await saveMenuToFirestore()
    alert('Page et menu sauvegardés !')
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
  padding: 0 12px;
  z-index: 10000;
  gap: 12px;
}
.admin-toolbar-left, .admin-toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.admin-toolbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}
.admin-badge {
  background: #EF4B54;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: 700;
  white-space: nowrap;
}
.admin-page-select {
  background: rgba(255,255,255,0.1);
  color: white;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.85em;
  cursor: pointer;
  outline: none;
}
.admin-page-select option {
  background: #1a1a2e;
  color: white;
}
.admin-page-select:hover {
  background: rgba(255,255,255,0.15);
}
.admin-block-type {
  font-size: 0.9em;
  font-weight: 600;
}
.device-toggle {
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 3px;
}
.device-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.device-btn:hover {
  color: rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.1);
}
.device-btn.active {
  color: white;
  background: rgba(255,255,255,0.2);
}
.admin-user {
  font-size: 0.8em;
  opacity: 0.8;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.admin-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  font-size: 0.85em;
  font-weight: 600;
  cursor: pointer;
  background: #3B82F6;
  color: white;
  white-space: nowrap;
}
.admin-btn:hover { background: #2563eb; }
.admin-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.admin-btn-secondary {
  background: rgba(255,255,255,0.15);
}
.admin-btn-secondary:hover { background: rgba(255,255,255,0.25); }
.admin-btn-login {
  background: #fff;
  color: #1a1a2e;
}
.admin-btn-login:hover { background: #f0f0f0; }

.admin-sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 9998;
  top: 48px;
}
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
.admin-loading {
  font-size: 0.8em;
  opacity: 0.6;
}
.admin-image-preview { width:100%; max-height:120px; object-fit:cover; border-radius:6px; margin-top:8px; }
.uploader-controls { display:flex; gap:8px; margin-top:8px; align-items:center; }
.file-input { display:none; }
.admin-uploaded-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; margin-top:8px; }
.admin-uploaded-item img { width:100%; height:56px; object-fit:cover; border-radius:6px; cursor:pointer; border:1px solid #2d2d3f; }
.images-loading { color:#666; font-size:0.9em; margin-top:8px; }
</style>

<style>
/* Global fallback: ensure site header is offset below admin toolbar when in admin mode */
#app-root.admin-mode .site-header {
  top: var(--admin-offset, 48px) !important;
}
/* Also offset the spacer to prevent content from snapping up */
#app-root.admin-mode .header-spacer {
  height: calc(76px + var(--admin-offset, 48px));
}
@media (max-width: 768px) {
  #app-root.admin-mode .header-spacer {
    height: calc(56px + var(--admin-offset, 48px));
  }
}
</style>
