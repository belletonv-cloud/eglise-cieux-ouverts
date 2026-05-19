import { ref, computed, provide } from 'vue'

const isAdminMode = ref(false)
const editingBlockId = ref(null)
const localBlocks = ref([])
const previewDevice = ref('desktop')

export function useAdmin() {
  const activeBlock = computed(() =>
    localBlocks.value.find(b => b.id === editingBlockId.value) || null
  )

  function enterAdmin(blocks) {
    isAdminMode.value = true
    if (blocks && blocks.length) {
      localBlocks.value = JSON.parse(JSON.stringify(blocks))
    }
  }

  function exitAdmin() {
    isAdminMode.value = false
    editingBlockId.value = null
    localBlocks.value = []
  }

  function selectBlock(id) {
    editingBlockId.value = id
  }

  function updateBlock(id, props) {
    const idx = localBlocks.value.findIndex(b => b.id === id)
    if (idx >= 0) {
      const block = localBlocks.value[idx]
      localBlocks.value[idx] = { ...block, props: { ...block.props, ...props } }
    }
  }

  function moveBlock(id, direction) {
    const idx = localBlocks.value.findIndex(b => b.id === id)
    if (idx < 0) return
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= localBlocks.value.length) return
    const [block] = localBlocks.value.splice(idx, 1)
    localBlocks.value.splice(newIdx, 0, block)
  }

  function removeBlock(id) {
    localBlocks.value = localBlocks.value.filter(b => b.id !== id)
    if (editingBlockId.value === id) editingBlockId.value = null
  }

  async function addBlock(type, afterId) {
    const { createBlock } = await import('~/utils/blockTypes.js')
    const newBlock = createBlock(type)
    if (afterId) {
      const idx = localBlocks.value.findIndex(b => b.id === afterId)
      localBlocks.value.splice(idx + 1, 0, newBlock)
    } else {
      localBlocks.value.push(newBlock)
    }
  }

  function getBlocks() {
    return localBlocks.value
  }

  provide('isAdmin', isAdminMode)
  provide('editingBlockId', editingBlockId)
  provide('selectBlock', selectBlock)
  provide('previewDevice', previewDevice)

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
    getBlocks,
  }
}
