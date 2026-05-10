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
        <button class="save-btn" :class="{ saved: saved }" @click="savePage" :disabled="saving || !currentPageIsBuilder">
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
          <button class="btn-add-block" @click="showBlockPicker = true" :disabled="!currentPageIsBuilder">+ Ajouter un bloc</button>
        </div>
      </div>

      <!-- Canvas -->
      <div class="canvas-wrap">
        <div
          class="canvas"
          :class="`canvas-${previewDevice}`"
        >
          <VueDraggable
            v-if="currentPageIsBuilder"
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
              :class="[
                getAnimClass(block.props),
                { triggered: triggeredBlocks.has(block.id) },
                { selected: selectedBlockId === block.id }
              ]"
              @click="onBlockWrapperClick($event, block.id)"
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
                :key="blockRenderKey(block)"
                :is="blockComponent(block.type)"
                :props="block.props"
                :visibility="block.visibility"
                :is-triggered="true"
              />
            </div>
          </VueDraggable>

          <div v-else-if="currentPage === 'agenda'" class="agenda-admin-panel">
            <div class="canvas-static-note">
              <p class="canvas-static-title">Agenda</p>
              <p class="canvas-static-text">Le rendu public vient de <code>{{ currentPageMeta?.file }}</code>.</p>
              <p class="canvas-static-text">Cette vue permet maintenant de gerer directement les evenements de l'agenda.</p>
            </div>

            <form class="agenda-form" @submit.prevent="saveAgendaEvent">
              <div class="agenda-form-header">
                <h2 class="agenda-form-title">{{ editingAgendaId ? 'Modifier l\'evenement' : 'Nouvel evenement' }}</h2>
                <div class="agenda-form-actions">
                  <button v-if="editingAgendaId" type="button" class="agenda-secondary-btn" @click="resetAgendaForm">Annuler</button>
                  <button type="submit" class="agenda-primary-btn" :disabled="agendaSaving">
                    {{ agendaSaving ? 'Enregistrement...' : editingAgendaId ? 'Mettre a jour' : 'Ajouter' }}
                  </button>
                </div>
              </div>

              <div v-if="agendaError" class="agenda-form-error">{{ agendaError }}</div>

              <div class="agenda-form-grid">
                <label class="agenda-field">
                  <span>Titre</span>
                  <input v-model.trim="agendaForm.titre" type="text" maxlength="120" required />
                </label>

                <label class="agenda-field">
                  <span>Date</span>
                  <input v-model="agendaForm.date" type="date" required />
                </label>

                <label class="agenda-field">
                  <span>Heure</span>
                  <input v-model="agendaForm.heure" type="time" />
                </label>

                <label class="agenda-field">
                  <span>Lieu</span>
                  <input v-model.trim="agendaForm.lieu" type="text" maxlength="120" />
                </label>

                <label class="agenda-field">
                  <span>Emoji</span>
                  <input v-model.trim="agendaForm.emoji" type="text" maxlength="8" placeholder="🎉" />
                </label>

                <label class="agenda-field">
                  <span>Lien externe</span>
                  <input v-model.trim="agendaForm.lien" type="url" placeholder="https://..." />
                </label>

                <label class="agenda-field">
                  <span>Billetterie</span>
                  <input v-model.trim="agendaForm.billetterie" type="url" placeholder="https://..." />
                </label>

                <label class="agenda-field agenda-field-full">
                  <span>Description</span>
                  <textarea v-model.trim="agendaForm.description" rows="4" maxlength="1500"></textarea>
                </label>
              </div>
            </form>

            <div v-if="!agendaLoading && agendaEvents.length > 0" class="agenda-filter-bar">
              <button type="button" class="agenda-filter-btn" :class="{ active: agendaFilter === 'upcoming' }" @click="agendaFilter = 'upcoming'">
                A venir ({{ upcomingAgendaCount }})
              </button>
              <button type="button" class="agenda-filter-btn" :class="{ active: agendaFilter === 'past' }" @click="agendaFilter = 'past'">
                Passes ({{ pastAgendaCount }})
              </button>
              <button type="button" class="agenda-filter-btn" :class="{ active: agendaFilter === 'all' }" @click="agendaFilter = 'all'">
                Tous ({{ agendaEvents.length }})
              </button>
            </div>

            <div v-if="agendaLoading" class="agenda-admin-state">Chargement des evenements...</div>
            <div v-else-if="agendaEvents.length === 0" class="agenda-admin-state">Aucun evenement.</div>
            <div v-else-if="filteredAgendaEvents.length === 0" class="agenda-admin-state">Aucun evenement dans ce filtre.</div>

            <div v-else class="agenda-admin-list">
              <article v-for="evt in filteredAgendaEvents" :key="evt.id" class="agenda-admin-card">
                <div class="agenda-admin-date">{{ formatAgendaAdminDate(evt.date) }}</div>
                <div class="agenda-admin-body">
                  <h3 class="agenda-admin-title">{{ evt.titre || 'Evenement sans titre' }}</h3>
                  <p v-if="evt.description" class="agenda-admin-desc">{{ evt.description }}</p>
                  <div class="agenda-admin-meta">
                    <span v-if="evt.heure">Heure: {{ evt.heure }}</span>
                    <span v-if="evt.lieu">Lieu: {{ evt.lieu }}</span>
                    <span v-if="evt.billetterie">Billetterie active</span>
                    <span v-if="evt.lien">Lien externe</span>
                  </div>
                  <div class="agenda-admin-actions">
                    <button type="button" class="agenda-secondary-btn" @click="startAgendaEdit(evt)">Modifier</button>
                    <button type="button" class="agenda-danger-btn" :disabled="agendaDeletingId === evt.id" @click="removeAgendaEvent(evt)">
                      {{ agendaDeletingId === evt.id ? 'Suppression...' : 'Supprimer' }}
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <div v-else class="canvas-static-note">
            <p class="canvas-static-title">Cette page reste speciale pour l'instant.</p>
            <p class="canvas-static-text">Le rendu public vient encore de <code>{{ currentPageMeta?.file }}</code>.</p>
          </div>

          <!-- Empty state -->
          <div v-if="currentPageIsBuilder && blocks.length === 0" class="canvas-empty">
            <p>✨ Cette page est vide.</p>
            <button class="btn-add-block" @click="showBlockPicker = true" :disabled="!currentPageIsBuilder">+ Ajouter un premier bloc</button>
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
import { BLOCK_TYPES, ANIMATIONS, createBlock, getDefaultPageBySlug, normalizePageBlocks } from '~/utils/blockTypes.js'
import PropsPanel from '~/components/editor/PropsPanel.vue'

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

// Signale aux blocs qu'ils sont dans l'éditeur → désactive les animations scroll
provide('isEditor', true)

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
  { slug: 'accueil', label: 'Accueil', icon: '🏠', builder: true, file: 'pages/index.vue' },
  { slug: 'agenda', label: 'Agenda', icon: '📅', builder: false, file: 'pages/agenda.vue' },
  { slug: 'messages', label: 'Messages', icon: '🎤', builder: true, file: 'pages/messages.vue' },
  { slug: 'photos', label: 'Photos', icon: '🖼️', builder: true, file: 'pages/photos.vue' },
  { slug: 'billetterie', label: 'Billetterie', icon: '🎟️', builder: true, file: 'pages/billetterie.vue' },
  { slug: 'contact', label: 'Contact', icon: '✉️', builder: true, file: 'pages/contact.vue' },
]

const devices = [
  { key: 'desktop', icon: '🖥️', label: 'Desktop' },
  { key: 'tablet',  icon: '📱', label: 'Tablette' },
  { key: 'mobile',  icon: '📲', label: 'Mobile' },
]

const { $db, $auth } = useNuxtApp()
const router = useRouter()
const currentPage = ref('accueil')
const blocks = ref(getDefaultPageBySlug('accueil'))
const selectedBlockId = ref(null)
const previewDevice = ref('desktop')
const showBlockPicker = ref(false)
const showNewPage = ref(false)
const saving = ref(false)
const saved = ref(false)
const triggeredBlocks = ref(new Set())
const previewVersions = ref({})
const agendaSaving = ref(false)
const agendaDeletingId = ref(null)
const agendaError = ref('')
const editingAgendaId = ref('')
const agendaFilter = ref('upcoming')

const agendaForm = reactive({
  titre: '',
  date: '',
  heure: '',
  lieu: '',
  description: '',
  lien: '',
  billetterie: '',
  emoji: '',
})

const currentPageMeta = computed(() => pages.find(p => p.slug === currentPage.value) ?? null)
const currentPageIsBuilder = computed(() => currentPageMeta.value?.builder !== false)
const currentPageLabel = computed(() => currentPageMeta.value?.label ?? '')
const selectedBlock = computed(() => blocks.value.find(b => b.id === selectedBlockId.value) ?? null)
const { evenements: agendaEvents, loading: agendaLoading, refresh: refreshAgendaEvents } = useEvenements({ futureOnly: false })
const sortedAgendaEvents = computed(() => {
  return [...agendaEvents.value].sort((a, b) => getAgendaDateValue(a.date) - getAgendaDateValue(b.date))
})
const upcomingAgendaCount = computed(() => sortedAgendaEvents.value.filter(evt => !isPastAgendaEvent(evt.date)).length)
const pastAgendaCount = computed(() => sortedAgendaEvents.value.filter(evt => isPastAgendaEvent(evt.date)).length)
const filteredAgendaEvents = computed(() => {
  if (agendaFilter.value === 'all') return sortedAgendaEvents.value
  if (agendaFilter.value === 'past') {
    return [...sortedAgendaEvents.value].filter(evt => isPastAgendaEvent(evt.date)).reverse()
  }
  return sortedAgendaEvents.value.filter(evt => !isPastAgendaEvent(evt.date))
})

function getAgendaDateValue(ts) {
  if (!ts) return 0
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function isPastAgendaEvent(ts) {
  const value = getAgendaDateValue(ts)
  if (!value) return false
  return value < Date.now()
}

function resetAgendaForm() {
  editingAgendaId.value = ''
  agendaError.value = ''
  agendaForm.titre = ''
  agendaForm.date = ''
  agendaForm.heure = ''
  agendaForm.lieu = ''
  agendaForm.description = ''
  agendaForm.lien = ''
  agendaForm.billetterie = ''
  agendaForm.emoji = ''
}

function toAgendaDateInput(ts) {
  if (!ts) return ''
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normaliseAgendaTime(value) {
  if (!value) return ''
  return value.slice(0, 5)
}

function toAgendaTimestamp(dateValue, timeValue) {
  const [year, month, day] = dateValue.split('-').map(Number)
  const [hours, minutes] = (timeValue || '00:00').split(':').map(Number)
  return new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0)
}

function startAgendaEdit(evt) {
  editingAgendaId.value = evt.id
  agendaError.value = ''
  agendaForm.titre = evt.titre || ''
  agendaForm.date = toAgendaDateInput(evt.date)
  agendaForm.heure = normaliseAgendaTime(evt.heure)
  agendaForm.lieu = evt.lieu || ''
  agendaForm.description = evt.description || ''
  agendaForm.lien = evt.lien || ''
  agendaForm.billetterie = evt.billetterie || ''
  agendaForm.emoji = evt.emoji || ''
}

function validateAgendaForm() {
  if (!agendaForm.titre || !agendaForm.date) {
    agendaError.value = 'Le titre et la date sont obligatoires.'
    return false
  }

  if (agendaForm.lien && !/^https?:\/\//.test(agendaForm.lien)) {
    agendaError.value = 'Le lien externe doit commencer par http:// ou https://.'
    return false
  }

  if (agendaForm.billetterie && !/^https?:\/\//.test(agendaForm.billetterie)) {
    agendaError.value = 'Le lien de billetterie doit commencer par http:// ou https://.'
    return false
  }

  agendaError.value = ''
  return true
}

async function saveAgendaEvent() {
  if (!validateAgendaForm()) return

  agendaSaving.value = true

  try {
    const { addDoc, collection, doc, Timestamp, updateDoc } = await import('firebase/firestore')
    const eventDate = toAgendaTimestamp(agendaForm.date, agendaForm.heure)
    const payload = {
      titre: agendaForm.titre,
      date: Timestamp.fromDate(eventDate),
      heure: normaliseAgendaTime(agendaForm.heure),
      lieu: agendaForm.lieu,
      description: agendaForm.description,
      lien: agendaForm.lien,
      billetterie: agendaForm.billetterie,
      emoji: agendaForm.emoji,
      updatedAt: new Date().toISOString(),
    }

    if (editingAgendaId.value) {
      await updateDoc(doc($db, 'evenements', editingAgendaId.value), payload)
    } else {
      await addDoc(collection($db, 'evenements'), {
        ...payload,
        createdAt: new Date().toISOString(),
      })
    }

    await refreshAgendaEvents()
    resetAgendaForm()
  } catch (e) {
    console.error('Agenda save error', e)
    agendaError.value = e.message || 'Erreur lors de l\'enregistrement.'
  } finally {
    agendaSaving.value = false
  }
}

async function removeAgendaEvent(evt) {
  if (!confirm(`Supprimer l'evenement "${evt.titre || 'sans titre'}" ?`)) return

  agendaDeletingId.value = evt.id

  try {
    const { deleteDoc, doc } = await import('firebase/firestore')
    await deleteDoc(doc($db, 'evenements', evt.id))
    if (editingAgendaId.value === evt.id) resetAgendaForm()
    await refreshAgendaEvents()
  } catch (e) {
    console.error('Agenda delete error', e)
    agendaError.value = e.message || 'Erreur lors de la suppression.'
  } finally {
    agendaDeletingId.value = null
  }
}

function formatAgendaAdminDate(ts) {
  if (!ts) return 'Date non renseignee'
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  if (Number.isNaN(date.getTime())) return 'Date invalide'
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function getBlockDef(type) { return BLOCK_TYPES[type] }
function blockComponent(type) { return BLOCK_COMPONENTS[type] || BlockRichText }
function blockRenderKey(block) {
  return `${block.id}:${previewVersions.value[block.id] || 0}`
}
function getAnimClass(p) {
  if (!p || !p.animation || p.animation === 'none') return ''
  const anim = ANIMATIONS.find(a => a.id === p.animation)
  return anim ? `block-${anim.css}` : ''
}

// ─── Défauts par page ────────────────────────────────────────────────────────
function getPageDefaults(slug) {
  return getDefaultPageBySlug(slug)
}

// ─── Load page from Firebase ──────────────────────────────────────────────────
async function loadPage(slug) {
  blocks.value = getPageDefaults(slug)
  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc($db, 'pages', slug))
    if (snap.exists() && snap.data().blocks?.length) {
      blocks.value = normalizePageBlocks(slug, snap.data().blocks)
    }
  } catch (e) {
    console.error('Load error', e)
  }
  await nextTick()
  triggerAllBlocks()
}

async function selectPage(slug) {
  currentPage.value = slug
  selectedBlockId.value = null
  if (!pages.find(page => page.slug === slug)?.builder) {
    blocks.value = []
    return
  }
  await loadPage(slug)
}

// ─── Save page to Firebase ────────────────────────────────────────────────────
async function savePage() {
  if (!currentPageIsBuilder.value) return
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
  nextTick(() => {
    triggeredBlocks.value = new Set([...triggeredBlocks.value, block.id])
  })
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

function onBlockWrapperClick(event, id) {
  if (event.target.closest('a, button, input, textarea, select, label, iframe')) return
  selectBlock(id)
}

function onBlockUpdate(updatedBlock) {
  const idx = blocks.value.findIndex(b => b.id === updatedBlock.id)
  if (idx !== -1) {
    const prevAnim = blocks.value[idx].props?.animation
    const nextAnim = updatedBlock.props?.animation
    Object.assign(blocks.value[idx], updatedBlock)
    blocks.value[idx].props = updatedBlock.props
    blocks.value[idx].visibility = updatedBlock.visibility

    // Rejouer l'animation si elle a changé
    if (nextAnim && nextAnim !== 'none' && nextAnim !== prevAnim) {
      previewVersions.value = {
        ...previewVersions.value,
        [updatedBlock.id]: (previewVersions.value[updatedBlock.id] || 0) + 1,
      }
      triggeredBlocks.value.delete(updatedBlock.id)
      triggeredBlocks.value = new Set(triggeredBlocks.value)
      nextTick(() => {
        setTimeout(() => {
          triggeredBlocks.value = new Set([...triggeredBlocks.value, updatedBlock.id])
        }, 50)
      })
    } else {
      // S'assurer que le bloc est bien déclenché
      triggeredBlocks.value = new Set([...triggeredBlocks.value, updatedBlock.id])
    }
  }
}

function triggerAllBlocks() {
  triggeredBlocks.value = new Set(blocks.value.map(b => b.id))
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
  cursor: default;
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

.canvas-static-note {
  padding: 28px 20px;
  margin: 20px;
  border: 1px solid #2d2d3f;
  border-radius: 12px;
  background: #13131f;
  color: #cbd5e1;
}

.canvas-static-title {
  margin: 0 0 8px;
  font-size: 1rem;
  font-weight: 700;
  color: white;
}

.canvas-static-text {
  margin: 0;
  color: #9999bb;
  line-height: 1.6;
}

.canvas-static-text + .canvas-static-text {
  margin-top: 6px;
}

.agenda-admin-panel {
  padding: 20px;
  background: #f8fafc;
}

.agenda-form {
  margin: 20px;
  padding: 24px;
  border-radius: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.agenda-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.agenda-form-title {
  margin: 0;
  font-size: 1.05em;
  font-weight: 700;
  color: #0f172a;
}

.agenda-form-actions {
  display: flex;
  gap: 10px;
}

.agenda-form-error {
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 0.9em;
  font-weight: 600;
}

.agenda-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.agenda-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.agenda-field span {
  font-size: 0.82em;
  font-weight: 700;
  color: #334155;
}

.agenda-field input,
.agenda-field textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: white;
  color: #0f172a;
  font: inherit;
}

.agenda-field textarea {
  resize: vertical;
}

.agenda-field-full {
  grid-column: 1 / -1;
}

.agenda-primary-btn,
.agenda-secondary-btn,
.agenda-danger-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 0.84em;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, background 0.2s;
}

.agenda-primary-btn {
  background: #064886;
  color: white;
}

.agenda-secondary-btn {
  background: #e2e8f0;
  color: #0f172a;
}

.agenda-danger-btn {
  background: #EF4B54;
  color: white;
}

.agenda-primary-btn:disabled,
.agenda-secondary-btn:disabled,
.agenda-danger-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.agenda-filter-bar {
  display: flex;
  gap: 10px;
  padding: 0 20px 20px;
  flex-wrap: wrap;
}

.agenda-filter-btn {
  border: 1px solid #cbd5e1;
  background: white;
  color: #334155;
  border-radius: 999px;
  padding: 9px 14px;
  font-size: 0.82em;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.agenda-filter-btn.active {
  background: #064886;
  border-color: #064886;
  color: white;
}

.agenda-admin-state {
  margin: 20px;
  padding: 24px;
  border-radius: 12px;
  background: white;
  color: #64748b;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.agenda-admin-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 20px 20px;
}

.agenda-admin-card {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  padding: 20px;
  border-radius: 14px;
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.agenda-admin-date {
  min-width: 150px;
  font-size: 0.84em;
  font-weight: 700;
  line-height: 1.5;
  color: #064886;
  text-transform: capitalize;
}

.agenda-admin-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
}

.agenda-admin-title {
  margin: 0;
  font-size: 1.05em;
  font-weight: 700;
  color: #0f172a;
}

.agenda-admin-desc {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.agenda-admin-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.agenda-admin-meta span {
  padding: 6px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #064886;
  font-size: 0.78em;
  font-weight: 600;
}

.agenda-admin-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

@media (max-width: 900px) {
  .admin-layout { flex-direction: column; }
  .sidebar-pages { width: 100%; min-width: 0; flex-direction: row; overflow-x: auto; border-right: none; border-bottom: 1px solid #2d2d3f; }
  .sidebar-logo { display: none; }
  .sidebar-section-label { display: none; }
  .pages-list { display: flex; flex: none; }
  .page-btn { white-space: nowrap; width: auto; padding: 10px 14px; font-size: 0.82em; }
  .sidebar-footer { flex-direction: row; flex-wrap: wrap; border-top: none; border-left: 1px solid #2d2d3f; padding: 8px 12px; }
  .sidebar-footer .save-btn,
  .sidebar-footer .logout-btn,
  .sidebar-footer .preview-site-btn { width: auto; font-size: 0.78em; padding: 6px 12px; white-space: nowrap; }
  .editor-main { height: auto; flex: 1; }
  .editor-toolbar { flex-wrap: wrap; height: auto; padding: 8px 12px; gap: 8px; }
  .toolbar-left, .toolbar-right { flex: none; }
  .toolbar-page-name { font-size: 0.78em; }
  .device-btn { padding: 4px 8px; font-size: 0.85em; }
  .btn-add-block { padding: 6px 12px; font-size: 0.78em; }
  .canvas-wrap { padding: 12px; }
  .canvas-tablet { width: 100%; }
  .canvas-mobile { width: 100%; }

  .agenda-form-grid {
    grid-template-columns: 1fr;
  }

  .agenda-form-header {
    flex-direction: column;
    align-items: stretch;
  }

  .agenda-form-actions,
  .agenda-admin-card {
    flex-direction: column;
  }

  .agenda-admin-date {
    min-width: 0;
  }

  .block-picker-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .sidebar-pages { flex-wrap: wrap; }
  .sidebar-footer { width: 100%; border-left: none; border-top: 1px solid #2d2d3f; justify-content: center; }
  .editor-toolbar { gap: 4px; }
  .toolbar-center { order: -1; width: 100%; justify-content: center; }
  .device-btn { padding: 4px 6px; font-size: 0.78em; }
  .block-picker-grid { grid-template-columns: 1fr; }
  .modal-block-picker { max-width: 100vw; border-radius: 0; max-height: 100vh; }
  .canvas-wrap { padding: 8px; }
}

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
