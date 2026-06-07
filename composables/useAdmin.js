import { ref, computed } from 'vue'

const isAdminMode = ref(false)
const editingBlockId = ref(null)
const localBlocks = ref([])
const previewDevice = ref('desktop')

// Undo/redo history
const undoStack = ref([])
const redoStack = ref([])
const MAX_HISTORY = 50

function pushHistory() {
  const snapshot = JSON.parse(JSON.stringify(localBlocks.value))
  undoStack.value.push(snapshot)
  if (undoStack.value.length > MAX_HISTORY) undoStack.value.shift()
  redoStack.value = []
}

export function useAdmin() {
  const activeBlock = computed(() =>
    localBlocks.value.find(b => b.id === editingBlockId.value) || null
  )

  function enterAdmin(blocks) {
    isAdminMode.value = true
    if (Array.isArray(blocks)) {
      localBlocks.value = JSON.parse(JSON.stringify(blocks))
      undoStack.value = []
      redoStack.value = []
    }
  }

  function exitAdmin() {
    isAdminMode.value = false
    editingBlockId.value = null
    localBlocks.value = []
    undoStack.value = []
    redoStack.value = []
    if (import.meta.client && typeof window !== 'undefined') {
      try {
        const { pathname, search, hash } = window.location
        const params = new URLSearchParams(search)
        params.delete('admin')
        window.history.replaceState(null, '', pathname + (params.toString() ? '?' + params.toString() : '') + hash)
      } catch (e) {
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
    pushHistory()
    localBlocks.value[idx] = { ...localBlocks.value[idx], props: { ...localBlocks.value[idx].props, ...props } }
  }

  function moveBlock(id, direction) {
    const idx = localBlocks.value.findIndex(b => b.id === id)
    if (idx < 0) return
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= localBlocks.value.length) return
    pushHistory()
    const [block] = localBlocks.value.splice(idx, 1)
    localBlocks.value.splice(newIdx, 0, block)
  }

  function removeBlock(id) {
    pushHistory()
    localBlocks.value = localBlocks.value.filter(b => b.id !== id)
    if (editingBlockId.value === id) editingBlockId.value = null
  }

  async function addBlock(type, afterId) {
    const { createBlock } = await import('~/utils/blockTypes.js')
    const newBlock = createBlock(type)
    if (!newBlock) return null
    pushHistory()
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
    pushHistory()
    localBlocks.value = blocks
  }

  function undo() {
    if (undoStack.value.length === 0) return
    const snapshot = JSON.parse(JSON.stringify(localBlocks.value))
    redoStack.value.push(snapshot)
    localBlocks.value = undoStack.value.pop()
  }

  function redo() {
    if (redoStack.value.length === 0) return
    const snapshot = JSON.parse(JSON.stringify(localBlocks.value))
    undoStack.value.push(snapshot)
    localBlocks.value = redoStack.value.pop()
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
    pushHistory()
    localBlocks.value = blocks
  }

  return {
    isAdminMode,
    editingBlockId,
    activeBlock,
    localBlocks,
    previewDevice,
    enterAdmin,
    exitAdmin,
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
    getBlocks,
    setBlocks,
  }
}
