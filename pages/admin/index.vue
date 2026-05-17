<template>
  <div class="admin-builder">
    <!-- Sidebar -->
    <aside class="builder-sidebar" :class="{collapsed: isSidebarCollapsed}">
      <button
        class="sidebar-toggle"
        @click="isSidebarCollapsed = !isSidebarCollapsed"
        :aria-expanded="!isSidebarCollapsed"
        aria-label="Ouvrir/Fermer la barre latérale"
      >≡</button>
      <!-- CRUD, pages, blocks, etc.  -->
      <div class="sidebar-content">
        <h2>Pages</h2>
        <ul>
          <li v-for="page in pages" :key="page.id">
            <button @click="selectPage(page.id)">{{ page.name }}</button>
          </li>
        </ul>
        <button @click="addPage">Ajouter une page</button>
      </div>
    </aside>

    <!-- Main Canvas & Toolbar -->
    <main class="builder-canvas">
      <div class="toolbar">
        <button @click="undo" :disabled="!canUndo">Annuler</button>
        <button @click="redo" :disabled="!canRedo">Rétablir</button>
        <button @click="previewDevice = previewDevice === 'mobile' ? 'desktop' : 'mobile'">
          {{ previewDevice === 'mobile' ? 'Mobile' : 'Desktop' }}
        </button>
      </div>

      <div
        class="preview-container"
        :class="[`preview-${previewDevice}`]"
      >
        <component
          v-for="block in currentPage.blocks"
          :key="block.id"
          :is="blockComponent(block.type)"
          v-bind="block.props"
          :is-triggered="triggeredBlocks.has(block.id)"
          :preview-device="previewDevice"
          :visibility="block.visibility"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from '~/composables/useToast'
import { useFirestoreSync } from '~/composables/useFirestoreSync'
import BlockText from '~/components/BlockText.vue'
import BlockImage from '~/components/BlockImage.vue'

// Etat UI
const isSidebarCollapsed = ref(false)
const previewDevice = ref('desktop') // ou 'mobile'
const triggeredBlocks = ref(new Set())

// Exemple données/pages/blocks (à remplacer par Firestore)
const pages = ref([
  { id: 'default', name: 'Page d’accueil', blocks: [
    { id: 'b1', type: 'BlockText', props: { modelValue: 'Texte de bienvenue', editable: true }, visibility: true },
    { id: 'b2', type: 'BlockImage', props: { src: 'https://placekitten.com/400/240', editable: true }, visibility: true }
  ]}
])
const currentPageId = ref('default')

const currentPage = computed(() => pages.value.find(p => p.id === currentPageId.value) ?? pages.value[0])

function selectPage(id) {
  currentPageId.value = id
}
function addPage() {
  const newId = `page_${Math.random().toString(36).slice(2, 8)}`
  pages.value.push({id: newId, name: 'Nouvelle page', blocks: []})
}

// Undo/redo stack (à intégrer avec Firestore)
const undoStack = ref([])
const redoStack = ref([])
const canUndo = computed(() => undoStack.value.length > 0)
const canRedo = computed(() => redoStack.value.length > 0)
function undo() {}
function redo() {}

// Toasts
const { showToast } = useToast()

// blockComponent utilitaire pour map block.type → composant (à compléter)
function blockComponent(type) {
  const mapping = {
    BlockText,
    BlockImage
  }
  return mapping[type] || 'div'
}

// Firestore sync (WIP)
// useFirestoreSync({ pages, undoStack, redoStack })

// TODO: gestion drag, CRUD blocks, focus, animations, accessibilité, etc.
</script>

<style scoped>
.admin-builder {
  display: flex;
  min-height: 100vh;
}
.builder-sidebar {
  min-width: 210px;
  max-width: 260px;
  background: #1a202c;
  color: #fff;
  padding: 1rem;
  transition: max-width 0.3s;
  position: relative;
}
.builder-sidebar.collapsed {
  max-width: 48px;
  overflow: hidden;
}
.sidebar-toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
.builder-canvas {
  flex: 1;
  background: #f7fafc;
  padding: 2rem;
}
.toolbar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.preview-container.preview-mobile {
  width: 375px;
  margin: 0 auto;
  border: 1px solid #bbb;
  background: #fff;
  min-height: 680px;
  border-radius: 2rem;
}
</style>
