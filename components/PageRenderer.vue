<template>
  <div class="page-renderer" :class="{ 'admin-mode': isAdmin && isMounted }">
    <div
      v-for="block in visibleBlocks"
      :key="block.id"
      class="block-wrapper"
      :class="[getAnimClass(block), useTrigger(block) ? { triggered: isTriggered(block.id) } : '', { 'admin-selected': isAdmin && editingBlockId === block.id }]"
      :ref="el => setWrapperRef(el, block.id)"
      @click="isAdmin ? selectBlock(block.id) : undefined"
    >
      <Suspense>
        <template #default>
          <component
            :is="blockComponent(block.type)"
            v-bind="block.props"
            :visibility="block.visibility"
            :is-triggered="useTrigger(block) ? isTriggered(block.id) : false"
            :block-id="block.id"
          />
        </template>
        <template #fallback>
          <!-- fallback empty during async component load (SSR will wait) -->
        </template>
      </Suspense>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, inject } from 'vue'
import { normalizeBlock, getAnimClass, filterByVisibility, shouldUseTrigger } from '~/lib/blocks/renderer'
import { resolveBlockComponent } from '~/lib/blocks/component-registry'
import { useBlockAnimation } from '~/composables/useBlockAnimation'

const isAdmin = inject('isAdmin', ref(false))
const isEditor = inject('isEditor', ref(false))
const editingBlockId = inject('editingBlockId', ref(null))
const selectBlock = inject('selectBlock', () => {})
const previewDevice = inject('previewDevice', ref('desktop'))

const props = defineProps({
  blocks: { type: Array, default: () => [] },
})

const {
  triggeredBlocks,
  isTriggered,
  setWrapperRef,
  setup,
  handleBlocksChange,
  handleAnimationChange,
} = useBlockAnimation(isAdmin)

const isMounted = ref(false)

const useTrigger = shouldUseTrigger

const fixedBlocks = computed(() => {
  return (props.blocks || []).map(normalizeBlock)
})

const visibleBlocks = computed(() => {
  return filterByVisibility(fixedBlocks.value, previewDevice.value || 'desktop')
})

function blockComponent(type) {
  return resolveBlockComponent(type)
}

setTimeout(() => {
  isMounted.value = true
  setup(props.blocks || [])
}, 0)

watch(() => (props.blocks || []).map(b => b.id).join(','), async () => {
  try {
    await nextTick()
    handleBlocksChange(props.blocks || [])
  } catch (err) {
    console.error('PageRenderer: error in blocks watcher', err)
  }
}, { deep: false })

let suppressAnimationWatcher = false
watch(() => fixedBlocks.value.map(b => ({ id: b.id, anim: b.props?.animation })), (newArr) => {
  if (suppressAnimationWatcher) return
  try {
    handleAnimationChange(fixedBlocks.value)
  } catch (err) {
    console.error('PageRenderer: error in animation watcher', err)
  }
}, { deep: false })
</script>

<style scoped>
.page-renderer { width: 100%; }
.admin-selected { outline: 2px solid #3B82F6; outline-offset: -2px; }
</style>

<style>
.admin-mode .block-wrapper {
  cursor: pointer;
  position: relative;
  transition: outline 0.15s;
}
.admin-mode .block-wrapper:hover {
  outline: 2px dashed rgba(59, 130, 246, 0.5);
  outline-offset: -2px;
}
</style>
