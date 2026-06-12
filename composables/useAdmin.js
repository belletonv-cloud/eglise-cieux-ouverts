import { ref, computed } from 'vue'
import { BLOCK_TYPES } from '~/utils/blockTypes.js'

const isAdminMode = ref(false)
const editingBlockId = ref(null)
const localBlocks = ref([])
const localBlocksPage = ref('')
const previewDevice = ref('desktop')
const hasUnsavedChanges = ref(false)

// Footer block (managed separately from page blocks)
const footerBlock = ref(null)
const editingFooter = ref(false)

function _blockLabel(type) {
  return BLOCK_TYPES[type]?.label || type || 'inconnu'
}

// Default design props merged into every block
export const DESIGN_DEFAULTS = {
  fontFamily: 'inherit',
  fontSize: 16,
  fontWeight: 400,
  textAlign: 'inherit',
  textColor: '',
  bgColor: '',
  padding: '',
}

export const DESIGN_FIELDS = [
  { key: 'fontFamily', label: 'Police', type: 'select', options: [
    { value: 'inherit', label: 'Par défaut' },
    { value: 'Nunito, sans-serif', label: 'Nunito' },
    { value: "'Playfair Display', serif", label: 'Playfair Display' },
    { value: 'Georgia, serif', label: 'Georgia' },
  ]},
  { key: 'fontSize', label: 'Taille police', type: 'number', min: 8, max: 72 },
  { key: 'fontWeight', label: 'Épaisseur', type: 'number', min: 100, max: 900, step: 100 },
  { key: 'textAlign', label: 'Alignement', type: 'select', options: [
    { value: 'inherit', label: 'Par défaut' },
    { value: 'left', label: 'Gauche' },
    { value: 'center', label: 'Centre' },
    { value: 'right', label: 'Droite' },
  ]},
  { key: 'textColor', label: 'Couleur texte', type: 'color' },
  { key: 'bgColor', label: 'Couleur fond', type: 'color' },
  { key: 'padding', label: 'Padding', type: 'text' },
]

export function mergeDesignDefaults(block) {
  if (!block) return block
  if (!block.props) block.props = {}
  const merged = { ...DESIGN_DEFAULTS }
  for (const key of Object.keys(DESIGN_DEFAULTS)) {
    if (block.props[key] !== undefined && block.props[key] !== '') {
      merged[key] = block.props[key]
    }
  }
  return { ...block, props: { ...merged, ...block.props } }
}

// Undo/redo history
const undoStack = ref([])
const redoStack = ref([])
const MAX_HISTORY = 50

function pushHistory(label) {
  const snapshot = JSON.parse(JSON.stringify(localBlocks.value))
  undoStack.value.push({ label, blocks: snapshot })
  if (undoStack.value.length > MAX_HISTORY) undoStack.value.shift()
  redoStack.value = []
  hasUnsavedChanges.value = true
}

export function useAdmin() {
  const activeBlock = computed(() =>
    localBlocks.value.find(b => b.id === editingBlockId.value) || null
  )

  // The block being edited in the sidebar (page block or footer block)
  const sidebarBlock = computed(() => {
    if (editingFooter.value) return footerBlock.value
    return activeBlock.value
  })

  // Schema used by the sidebar AutoEditor
  const sidebarSchema = computed(() => {
    const block = sidebarBlock.value
    if (!block?.type) return []
    return BLOCK_TYPES[block.type]?.schema || []
  })

  function clearBlocks() {
    localBlocks.value = []
    localBlocksPage.value = ''
  }

  function enterAdmin(blocks, pageSlug) {
    isAdminMode.value = true
    if (Array.isArray(blocks)) {
      localBlocks.value = JSON.parse(JSON.stringify(blocks))
      localBlocksPage.value = pageSlug || ''
      undoStack.value = []
      redoStack.value = []
    }
  }

  function exitAdmin() {
    isAdminMode.value = false
    editingBlockId.value = null
    editingFooter.value = false
    footerBlock.value = null
    localBlocks.value = []
    localBlocksPage.value = ''
    undoStack.value = []
    redoStack.value = []
    if (import.meta.client) {
      try {
        const route = useRoute()
        const router = useRouter()
        const query = { ...route.query }
        delete query.admin
        router.replace({ query }).catch(() => {})
      } catch {
        // swallow
      }
    }
  }

  function selectBlock(id) {
    editingFooter.value = false
    editingBlockId.value = id
  }

  function updateBlock(id, props) {
    const idx = localBlocks.value.findIndex(b => b.id === id)
    if (idx < 0) return
    const label = _blockLabel(localBlocks.value[idx]?.type)
    pushHistory(`Modification du bloc « ${label} »`)
    localBlocks.value[idx] = { ...localBlocks.value[idx], props: { ...localBlocks.value[idx].props, ...props } }
  }

  function moveBlock(id, direction) {
    const idx = localBlocks.value.findIndex(b => b.id === id)
    if (idx < 0) return
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= localBlocks.value.length) return
    const label = _blockLabel(localBlocks.value[idx]?.type)
    pushHistory(`Déplacement du bloc « ${label} »`)
    const [block] = localBlocks.value.splice(idx, 1)
    localBlocks.value.splice(newIdx, 0, block)
  }

  function removeBlock(id) {
    const idx = localBlocks.value.findIndex(b => b.id === id)
    const label = idx >= 0 ? _blockLabel(localBlocks.value[idx]?.type) : 'inconnu'
    pushHistory(`Suppression du bloc « ${label} »`)
    localBlocks.value = localBlocks.value.filter(b => b.id !== id)
    if (editingBlockId.value === id) editingBlockId.value = null
  }

  async function addBlock(type, afterId) {
    const { createBlock } = await import('~/utils/blockTypes.js')
    const newBlock = createBlock(type)
    if (!newBlock) return null
    const label = _blockLabel(type)
    pushHistory(`Ajout du bloc « ${label} »`)
    if (afterId) {
      const idx = localBlocks.value.findIndex(b => b.id === afterId)
      localBlocks.value.splice(idx + 1, 0, newBlock)
    } else {
      localBlocks.value.push(newBlock)
    }
    return newBlock
  }

  function reorderBlocks(blocks) {
    if (!Array.isArray(blocks)) return
    if (blocks.length === localBlocks.value.length && blocks.every((b, i) => b?.id === localBlocks.value[i]?.id)) {
      return
    }
    pushHistory('Réordonnancement')
    localBlocks.value = blocks
  }

  function undo() {
    if (undoStack.value.length === 0) return
    const snapshot = JSON.parse(JSON.stringify(localBlocks.value))
    redoStack.value.push({ label: undoStack.value.at(-1).label, blocks: snapshot })
    localBlocks.value = undoStack.value.pop().blocks
  }

  function redo() {
    if (redoStack.value.length === 0) return
    const snapshot = JSON.parse(JSON.stringify(localBlocks.value))
    undoStack.value.push({ label: redoStack.value.at(-1).label, blocks: snapshot })
    localBlocks.value = redoStack.value.pop().blocks
  }

  function canUndo() {
    return undoStack.value.length > 0
  }

  function canRedo() {
    return redoStack.value.length > 0
  }

  function getBlocks() {
    return localBlocks.value
  }

  function setBlocks(blocks) {
    if (!Array.isArray(blocks)) return
    if (blocks.length === localBlocks.value.length && blocks.every((b, i) => b?.id === localBlocks.value[i]?.id)) {
      return
    }
    pushHistory('Réinitialisation')
    localBlocks.value = blocks
  }

  function nextUndoLabel() {
    if (undoStack.value.length === 0) return ''
    return undoStack.value.at(-1).label
  }

  function nextRedoLabel() {
    if (redoStack.value.length === 0) return ''
    return redoStack.value.at(-1).label
  }

  function markSaved() {
    hasUnsavedChanges.value = false
  }

  // ─── Footer block management ─────────────────────────────────

  async function loadFooterBlock() {
    try {
      const { getDoc, doc } = await import('firebase/firestore')
      const { $db } = useNuxtApp()
      const snap = await getDoc(doc($db, 'settings', 'footer'))
      if (snap.exists()) {
        const data = snap.data()
        const merged = mergeDesignDefaults({
          id: 'block-footer',
          type: 'footer',
          props: { ...data },
        })
        footerBlock.value = merged
      } else {
        const { createBlock } = await import('~/utils/blockTypes.js')
        const fb = createBlock('footer')
        footerBlock.value = mergeDesignDefaults(fb)
      }
    } catch (e) {
      console.warn('useAdmin: could not load footer block', e)
      const { createBlock } = await import('~/utils/blockTypes.js')
      const fb = createBlock('footer')
      footerBlock.value = mergeDesignDefaults(fb)
    }
  }

  async function saveFooterBlock() {
    if (!footerBlock.value) return
    try {
      const { setDoc, doc } = await import('firebase/firestore')
      const { $db } = useNuxtApp()
      await setDoc(doc($db, 'settings', 'footer'), {
        ...footerBlock.value.props,
        updatedAt: new Date().toISOString(),
      })
    } catch (e) {
      console.error('useAdmin: failed to save footer', e)
      throw e
    }
  }

  function selectFooter() {
    editingBlockId.value = null
    editingFooter.value = true
  }

  function closeFooterEditor() {
    editingFooter.value = false
  }

  function updateFooterBlock(props) {
    if (!footerBlock.value) return
    footerBlock.value = {
      ...footerBlock.value,
      props: { ...footerBlock.value.props, ...props },
    }
    hasUnsavedChanges.value = true
  }

  return {
    isAdminMode,
    editingBlockId,
    activeBlock,
    footerBlock,
    editingFooter,
    sidebarBlock,
    sidebarSchema,
    localBlocks,
    localBlocksPage,
    previewDevice,
    hasUnsavedChanges,
    enterAdmin,
    exitAdmin,
    clearBlocks,
    selectBlock,
    updateBlock,
    moveBlock,
    removeBlock,
    addBlock,
    reorderBlocks,
    undo,
    redo,
    canUndo,
    canRedo,
    nextUndoLabel,
    nextRedoLabel,
    markSaved,
    getBlocks,
    setBlocks,
    loadFooterBlock,
    saveFooterBlock,
    selectFooter,
    closeFooterEditor,
    updateFooterBlock,
  }
}
