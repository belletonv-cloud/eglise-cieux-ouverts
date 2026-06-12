import { ref, computed } from 'vue'
import { BLOCK_TYPES } from '~/utils/blockTypes.js'

const isAdminMode = ref(false)
const editingBlockId = ref(null)
const localBlocks = ref([])
const localBlocksPage = ref('')
const previewDevice = ref('desktop')
const hasUnsavedChanges = ref(false)

function _blockLabel(type) {
  return BLOCK_TYPES[type]?.label || type || 'inconnu'
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

  return {
    isAdminMode,
    editingBlockId,
    activeBlock,
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
  }
}
