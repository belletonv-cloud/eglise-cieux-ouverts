<template>
  <div class="admin-layout">
    <!-- ─── Sidebar gauche : liste des pages ─── -->
    <aside class="sidebar-pages">
      <div class="sidebar-logo">
        <img src="/logo.png" alt="Cieux Ouverts" class="logo-img" />
        <span class="logo-text">Admin</span>
      </div>

      <div class="pages-list">
        <p class="sidebar-section-label">Pages</p>
        <button
          v-for="page in pages"
          :key="page.slug"
          class="page-btn"
          :class="{ active: currentPage === page.slug }"
          @click="selectPage(page.slug)"
        >
          {{ page.icon }} {{ page.label }}
        </button>
        <button class="page-btn page-btn-new" @click="showNewPage = true">+ Nouvelle page</button>
      </div>

      <div class="sidebar-footer">
        <a href="/" target="_blank" class="preview-site-btn">↗ Voir le site</a>
        <button class="save-btn" :class="{ saved: saved }" @click="savePage" :disabled="saving">
          {{ saving ? 'Sauvegarde...' : saved ? '✓ Sauvegardé' : 'Sauvegarder' }}
        </button>
        <button class="logout-btn" @click="logout">Déconnexion</button>
      </div>
    </aside>

    <!-- ─── Zone centrale : canvas + toolbar ─── -->
    <main class="editor-main">
      <!-- Toolbar -->
      <div class="editor-toolbar">
        <div class="toolbar-left">
          <span class="toolbar-page-name">{{ currentPageLabel }}</span>
        </div>
        <div class="toolbar-center">
          <!-- Device preview -->
          <div class="device-switcher">
            <button
              v-for="d in devices"
              :key="d.key"
              class="device-btn"
              :class="{ active: previewDevice === d.key }"
              @click="previewDevice = d.key"
              :title="d.label"
            >{{ d.icon }}</button>
          </div>
        </div>
        <div class="toolbar-right">
          <button class="btn-add-block" @click="showBlockPicker = true">+ Ajouter un bloc</button>
        </div>
      </div>

      <!-- Canvas -->
      <div class="canvas-wrap">
        <div
          class="canvas"
          :class="`canvas-${previewDevice}`"
        >
          <VueDraggable
            v-model="blocks"
            handle=".drag-handle"
            animation="200"
            ghostClass="block-ghost"
            @end="onDragEnd"
          >
            <div
              v-for="block in blocks"
              :key="block.id"
              class="block-wrapper"
              :class="{ selected: selectedBlockId === block.id }"
              @click.stop="selectBlock(block.id)"
            >
              <!-- Block overlay controls -->
              <div class="block-controls">
                <span class="drag-handle" title="Déplacer">⠿</span>
                <span class="block-type-badge">{{ getBlockDef(block.type)?.icon }} {{ getBlockDef(block.type)?.label }}</span>
                <div class="block-actions">
                  <button @click.stop="duplicateBlock(block.id)" title="Dupliquer">⧉</button>
                  <button @click.stop="deleteBlock(block.id)" title="Supprimer" class="btn-del">✕</button>
                </div>
              </div>
              <!-- Rendered block -->
              <component
                :is="blockComponent(block.type)"
                :props="block.props"
                :visibility="block.visibility"
              />
            </div>
          </VueDraggable>

          <!-- Empty state -->
          <div v-if="blocks.length === 0" class="canvas-empty">
            <p>✨ Cette page est vide.</p>
            <button class="btn-add-block" @click="showBlockPicker = true">+ Ajouter un premier bloc</button>
          </div>
        </div>
      </div>
    </main>

    <!-- ─── Panneau propriétés ─── -->
    <PropsPanel
      v-if="selectedBlock"
      :block="selectedBlock"
      @update="onBlockUpdate"
      @close="selectedBlockId = null"
      @delete="deleteBlock"
    />

    <!-- ─── Modal : ajouter un bloc ─── -->
    <div v-if="showBlockPicker" class="modal-overlay" @click.self="showBlockPicker = false">
      <div class="modal-block-picker">
        <div class="modal-header">
          <h3>Ajouter un bloc</h3>
          <button @click="showBlockPicker = false">✕</button>
        </div>
        <div class="block-picker-grid">
          <button
            v-for="(def, type) in BLOCK_TYPES"
            :key="type"
            class="picker-item"
            @click="addBlock(type)"
          >
            <span class="picker-icon">{{ def.icon }}</span>
            <span class="picker-label">{{ def.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { VueDraggable } from 'vue-draggable-plus'
import { BLOCK_TYPES, createBlock, getDefaultHomePage } from '~/utils/blockTypes.js'
import PropsPanel from '~/components/editor/PropsPanel.vue'
import PageRenderer from '~/components/PageRenderer.vue'

import BlockHero from '~/components/blocks/BlockHero.vue'
import BlockBienvenue from '~/components/blocks/BlockBienvenue.vue'
import BlockRejoins from '~/components/blocks/BlockRejoins.vue'
import BlockAspirations from '~/components/blocks/BlockAspirations.vue'
import BlockContact from '~/components/blocks/BlockContact.vue'
import BlockRichText from '~/components/blocks/BlockRichText.vue'
import BlockTextImage from '~/components/blocks/BlockTextImage.vue'
import BlockGallery from '~/components/blocks/BlockGallery.vue'
import BlockSpacer from '~/components/blocks/BlockSpacer.vue'
import BlockFullWidthImage from '~/components/blocks/BlockFullWidthImage.vue'
import BlockVision from '~/components/blocks/BlockVision.vue'
import BlockActivities from '~/components/blocks/BlockActivities.vue'
import BlockNousRejoindre from '~/components/blocks/BlockNousRejoindre.vue'

definePageMeta({ layout: false })

const BLOCK_COMPONENTS = {
  hero: BlockHero,
  bienvenue: BlockBienvenue,
  rejoins: BlockRejoins,
  aspirations: BlockAspirations,
  contact: BlockContact,
  richText: BlockRichText,
  textImage: BlockTextImage,
  gallery: BlockGallery,
  spacer: BlockSpacer,
  fullWidthImage: BlockFullWidthImage,
  vision: BlockVision,
  activities: BlockActivities,
  nousRejoindre: BlockNousRejoindre,
}

const pages = [
  { slug: 'accueil',  label: 'Accueil',  icon: '🏠' },
  { slug: 'agenda',   label: 'Agenda',   icon: '📅' },
  { slug: 'messages', label: 'Messages', icon: '🎤' },
  { slug: 'photos', label: 'Photos', icon: '🖼️' },
  { slug: 'billetterie', label: 'Billetterie', icon: '🎟️' },
  { slug: 'contact',  label: 'Contact',  icon: '✉️' },
]

const devices = [
  { key: 'desktop', icon: '🖥️', label: 'Desktop' },
  { key: 'tablet',  icon: '📱', label: 'Tablette' },
  { key: 'mobile',  icon: '📲', label: 'Mobile' },
]

const { $db, $auth } = useNuxtApp()
const router = useRouter()
const currentPage = ref('accueil')
const blocks = ref(getDefaultHomePage())
const selectedBlockId = ref(null)
const previewDevice = ref('desktop')
const showBlockPicker = ref(false)
const showNewPage = ref(false)
const saving = ref(false)
const saved = ref(false)

const currentPageLabel = computed(() => pages.find(p => p.slug === currentPage.value)?.label ?? '')
const selectedBlock = computed(() => blocks.value.find(b => b.id === selectedBlockId.value) ?? null)

function getBlockDef(type) { return BLOCK_TYPES[type] }
function blockComponent(type) { return BLOCK_COMPONENTS[type] || BlockRichText }

// ─── Défauts par page ────────────────────────────────────────────────────────
function getPageDefaults(slug) {
  if (slug === 'accueil') return getDefaultHomePage()
  return []
}

// ─── Load page from Firebase ──────────────────────────────────────────────────
async function loadPage(slug) {
  // Afficher les défauts immédiatement pendant le chargement
  blocks.value = getPageDefaults(slug)
  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc($db, 'pages', slug))
    if (snap.exists() && snap.data().blocks?.length) {
      blocks.value = snap.data().blocks
    }
    // sinon on garde les défauts déjà affichés
  } catch (e) {
    console.error('Load error', e)
    // on garde les défauts
  }
}

async function selectPage(slug) {
  currentPage.value = slug
  selectedBlockId.value = null
  await loadPage(slug)
}

// ─── Save page to Firebase ────────────────────────────────────────────────────
async function savePage() {
  saving.value = true; saved.value = false
  try {
    const { doc, setDoc } = await import('firebase/firestore')
    await setDoc(doc($db, 'pages', currentPage.value), {
      blocks: JSON.parse(JSON.stringify(blocks.value)),
      updatedAt: new Date().toISOString()
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (e) {
    console.error('Save error', e)
    alert('Erreur lors de la sauvegarde : ' + e.message)
  }
  saving.value = false
}

// ─── Block operations ─────────────────────────────────────────────────────────
function addBlock(type) {
  const block = createBlock(type)
  blocks.value.push(block)
  selectedBlockId.value = block.id
  showBlockPicker.value = false
}

function deleteBlock(id) {
  blocks.value = blocks.value.filter(b => b.id !== id)
  if (selectedBlockId.value === id) selectedBlockId.value = null
}

function duplicateBlock(id) {
  const idx = blocks.value.findIndex(b => b.id === id)
  if (idx === -1) return
  const copy = JSON.parse(JSON.stringify(blocks.value[idx]))
  copy.id = crypto.randomUUID()
  blocks.value.splice(idx + 1, 0, copy)
  selectedBlockId.value = copy.id
}

function selectBlock(id) {
  selectedBlockId.value = id === selectedBlockId.value ? null : id
}

function onBlockUpdate(updatedBlock) {
  const idx = blocks.value.findIndex(b => b.id === updatedBlock.id)
  if (idx !== -1) {
    blocks.value.splice(idx, 1, updatedBlock)
  }
}

function onDragEnd() {
  // auto-save after reorder
  savePage()
}

async function logout() {
  const { signOut } = await import('firebase/auth')
  await signOut($auth)
  router.replace('/admin/login')
}

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────
// ─── Auth guard ───────────────────────────────────────────────────────────────
onMounted(async () => {
  const { onAuthStateChanged } = await import('firebase/auth')
  onAuthStateChanged($auth, (user) => {
    if (!user) router.replace('/admin/login')
  })
  await loadPage('accueil')
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); savePage() }
    if (e.key === 'Escape') selectedBlockId.value = null
  })
})
</script>

<style>
/* ─── Layout ────────────────────────────────────────────────────────────────── */
html, body { height: 100%; background: #0f0f1a !important; }

.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: Helvetica, Arial, sans-serif;
  background: #0f0f1a;
  color: #e2e8f0;
}

/* ─── Sidebar pages ─────────────────────────────────────────────────────────── */
.sidebar-pages {
  width: 200px;
  min-width: 180px;
  background: #13131f;
  border-right: 1px solid #2d2d3f;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 18px 16px;
  border-bottom: 1px solid #2d2d3f;
}
.logo-img { width: 28px; height: 28px; border-radius: 6px; object-fit: cover; }
.logo-text { font-weight: 700; font-size: 0.9em; color: white; }

.sidebar-section-label {
  font-size: 0.68em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #4a4a6a;
  padding: 14px 16px 6px;
}

.pages-list { flex: 1; }

.page-btn {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 16px;
  background: none;
  border: none;
  color: #9999bb;
  font-size: 0.88em;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  border-radius: 0;
}
.page-btn:hover { background: #1e1e2e; color: white; }
.page-btn.active { background: #064886; color: white; font-weight: 600; }
.page-btn-new { color: #4a4a6a; font-style: italic; }
.page-btn-new:hover { color: #7c7ca8; }

.sidebar-footer {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid #2d2d3f;
}

.preview-site-btn {
  display: block;
  text-align: center;
  padding: 8px;
  background: #1e1e2e;
  color: #9999bb;
  border-radius: 8px;
  font-size: 0.82em;
  text-decoration: none;
}
.preview-site-btn:hover { color: white; background: #2d2d3f; text-decoration: none; }

.save-btn {
  width: 100%;
  padding: 10px;
  background: #064886;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.88em;
  cursor: pointer;
  transition: background 0.2s;
}
.save-btn:hover { background: #0a60b8; }
.save-btn.saved { background: #0a6640; }
.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.logout-btn {
  width: 100%;
  padding: 8px;
  background: transparent;
  border: 1px solid #3d3d55;
  border-radius: 8px;
  color: #7c7c9a;
  font-size: 0.82em;
  cursor: pointer;
  transition: all 0.15s;
}
.logout-btn:hover { border-color: #EF4B54; color: #EF4B54; }

/* ─── Editor main ────────────────────────────────────────────────────────────── */
.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #17172a;
}

/* Toolbar */
.editor-toolbar {
  height: 52px;
  background: #13131f;
  border-bottom: 1px solid #2d2d3f;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  gap: 12px;
  flex-shrink: 0;
}

.toolbar-left, .toolbar-right { flex: 1; }
.toolbar-right { display: flex; justify-content: flex-end; }
.toolbar-center { display: flex; justify-content: center; }

.toolbar-page-name {
  font-size: 0.85em;
  font-weight: 600;
  color: #9999bb;
}

.device-switcher {
  display: flex;
  background: #1e1e2e;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #2d2d3f;
}
.device-btn {
  background: none;
  border: none;
  color: #9999bb;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 1em;
  transition: background 0.15s;
}
.device-btn.active { background: #064886; color: white; }
.device-btn:hover:not(.active) { background: #2d2d3f; color: white; }

.btn-add-block {
  background: #EF4B54;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.85em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-add-block:hover { background: #d63d46; }

/* Canvas */
.canvas-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #1a1a2e;
}

.canvas {
  background: white;
  min-height: 400px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.5);
  transition: width 0.3s ease;
}

.canvas-desktop { width: 100%; max-width: 100%; }
.canvas-tablet  { width: 768px; }
.canvas-mobile  { width: 390px; }

/* Block wrapper */
.block-wrapper {
  position: relative;
  cursor: pointer;
  outline: 2px solid transparent;
  transition: outline 0.15s;
}
.block-wrapper:hover { outline: 2px solid rgba(6,72,134,0.5); }
.block-wrapper.selected { outline: 2px solid #064886; }

.block-controls {
  position: absolute;
  top: 0; left: 0; right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: #064886;
  color: white;
  font-size: 0.78em;
  z-index: 100;
  opacity: 0;
  transition: opacity 0.15s;
  pointer-events: none;
}
.block-wrapper:hover .block-controls,
.block-wrapper.selected .block-controls {
  opacity: 1;
  pointer-events: all;
}

.drag-handle {
  cursor: grab;
  font-size: 1.2em;
  opacity: 0.8;
  padding: 0 4px;
}
.drag-handle:active { cursor: grabbing; }

.block-type-badge { flex: 1; font-weight: 600; font-size: 0.85em; }

.block-actions {
  display: flex;
  gap: 4px;
}
.block-actions button {
  background: rgba(255,255,255,0.15);
  border: none;
  color: white;
  width: 24px; height: 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  display: flex; align-items: center; justify-content: center;
}
.block-actions button:hover { background: rgba(255,255,255,0.3); }
.block-actions .btn-del:hover { background: rgba(239,75,84,0.8); }

/* Ghost during drag */
.block-ghost { opacity: 0.4; background: #064886 !important; }

/* Empty canvas */
.canvas-empty {
  padding: 80px 20px;
  text-align: center;
  color: #9999bb;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.canvas-empty p { font-size: 1.1em; }

/* ─── Block picker modal ─────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

.modal-block-picker {
  background: #1e1e2e;
  border-radius: 16px;
  width: 560px;
  max-width: 95vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #2d2d3f;
}
.modal-header h3 { font-size: 1em; font-weight: 700; color: white; }
.modal-header button {
  background: none; border: none; color: #888; font-size: 1.2em; cursor: pointer;
}

.block-picker-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 16px;
}

.picker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px 10px;
  background: #2d2d3f;
  border: 1.5px solid #3d3d55;
  border-radius: 12px;
  cursor: pointer;
  color: #e2e8f0;
  transition: all 0.15s;
}
.picker-item:hover {
  background: #064886;
  border-color: #064886;
  color: white;
}
.picker-icon { font-size: 1.6em; }
.picker-label { font-size: 0.78em; font-weight: 600; text-align: center; }
</style>
