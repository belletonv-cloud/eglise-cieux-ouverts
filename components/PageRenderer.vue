<template>
  <div class="page-renderer" :class="{ 'admin-mode': isAdmin }">
    <div 
      v-for="block in visibleBlocks" 
      :key="block.id"
      class="block-wrapper"
      :class="[getAnimClass(block), useTrigger(block) ? { triggered: isTriggered(block.id) } : '', { 'admin-selected': isAdmin && editingBlockId === block.id }]"
      :ref="el => setWrapperRef(el, block.id)"
      @click="isAdmin ? selectBlock(block.id) : undefined"
    >
      <component
        :is="blockComponent(block.type)"
        v-bind="block.props"
        :visibility="block.visibility"
        :is-triggered="useTrigger(block) ? isTriggered(block.id) : false"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, watch, nextTick, inject } from 'vue'
import { ANIMATIONS } from '~/utils/blockTypes.js'
import BlockHero from '~/components/blocks/BlockHero.vue'
import BlockBienvenue from '~/components/blocks/BlockBienvenue.vue'
import BlockRejoins from '~/components/blocks/BlockRejoins.vue'
import BlockAspirations from '~/components/blocks/BlockAspirations.vue'
import BlockContact from '~/components/blocks/BlockContact.vue'
import BlockRichText from '~/components/blocks/BlockRichText.vue'
import BlockFullWidthImage from '~/components/blocks/BlockFullWidthImage.vue'
import BlockVision from '~/components/blocks/BlockVision.vue'
import BlockNousRejoindre from '~/components/blocks/BlockNousRejoindre.vue'
import BlockActivities from '~/components/blocks/BlockActivities.vue'
import BlockTextImage from '~/components/blocks/BlockTextImage.vue'
import BlockGallery from '~/components/blocks/BlockGallery.vue'
import BlockSpacer from '~/components/blocks/BlockSpacer.vue'

const isAdmin = inject('isAdmin', ref(false))
const isEditor = inject('isEditor', ref(false))
const editingBlockId = inject('editingBlockId', ref(null))
const selectBlock = inject('selectBlock', () => {})

const COMPONENTS = {
  hero: BlockHero,
  bienvenue: BlockBienvenue,
  rejoins: BlockRejoins,
  aspirations: BlockAspirations,
  contact: BlockContact,
  richText: BlockRichText,
  fullWidthImage: BlockFullWidthImage,
  vision: BlockVision,
  nousRejoindre: BlockNousRejoindre,
  activities: BlockActivities,
  textImage: BlockTextImage,
  gallery: BlockGallery,
  spacer: BlockSpacer,
}

const props = defineProps({
  blocks: { type: Array, default: () => [] },
})

const previewDevice = inject('previewDevice', ref('desktop'))

function blockComponent(type) {
  return COMPONENTS[type] || BlockRichText
}

import { BLOCK_TYPES } from '~/utils/blockTypes.js'

// Correction universelle SSR/no-JS : repair/flatten block props if broken/migrated badly
function cleanBlock(block) {
  // 1. Si double props (props.props), on aplatit
  if (block && block.props && block.props.props && typeof block.props.props === 'object') {
    block.props = { ...block.props.props }
  }
  // 2. Si le bloc est de type connu et a des defaults, on merge avec les defaults pour fallback SSR
  if (block && block.type && BLOCK_TYPES[block.type]) {
    const safe = {}
    for (const [k, v] of Object.entries(block.props)) {
      if (v !== '' && v !== null && v !== undefined) safe[k] = v
    }
    block.props = { ...BLOCK_TYPES[block.type].defaults, ...safe }
  }

  return block
}

// Corrige TOUS les blocs juste avant de les rendre
const fixedBlocks = computed(() => {
  return props.blocks.map(cleanBlock)
})

const visibleBlocks = computed(() => {
  return fixedBlocks.value.filter(block => {
    const v = block.visibility || {}
    if (props.previewDevice === 'mobile' && v.mobile === false) return false
    if (props.previewDevice === 'tablet' && v.tablet === false) return false
    if (props.previewDevice === 'desktop' && v.desktop === false) return false
    return true
  })
})

function getAnimClass(block) {
  if (!block || !block.props || !block.props.animation || block.props.animation === 'none') return ''
  // Blocs avec view-timeline interne : pas d'animation wrapper (conflit)
  if (block.type === 'aspirations' || block.type === 'nousRejoindre') return ''
  const anim = ANIMATIONS.find(a => a.id === block.props.animation)
  return anim ? `block-${anim.css}` : ''
}

function useTrigger(block) {
  return block.type !== 'aspirations' && block.type !== 'nousRejoindre'
}

const triggeredBlocks = ref(new Set())
const wrapperRefs = ref({})
const lastAnimations = ref({})

function isTriggered(id) {
  return triggeredBlocks.value.has(id)
}

function setWrapperRef(el, id) {
  if (el) wrapperRefs.value[id] = el
}

let observer = null

// En mode édition, pré-initialiser tous les IDs comme déclenchés
if (isEditor) {
  const allIds = (props.blocks || []).map(b => b.id).filter(Boolean)
  triggeredBlocks.value = new Set(allIds)
}

onMounted(() => {
  if (isEditor) return

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.dataset.blockId
        if (id) {
          triggeredBlocks.value = new Set([...triggeredBlocks.value, id])
          observer.unobserve(entry.target)
        }
      }
    })
  }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' })

  observeElements()
  // initialize lastAnimations map
  lastAnimations.value = Object.fromEntries((fixedBlocks.value || []).map(b => [b.id, b.props?.animation]))
})

watch(() => props.blocks, async () => {
  await nextTick()
  if (isEditor) {
    const allIds = (props.blocks || []).map(b => b.id).filter(Boolean)
    triggeredBlocks.value = new Set(allIds)
    return
  }
  observeElements()
}, { deep: true })

// When a block's animation prop changes, reset its triggered state so the new animation
// can run again on next intersection/scroll.
watch(fixedBlocks, (newBlocks, oldBlocks) => {
  const oldMap = lastAnimations.value || {}
  const newMap = {}
  for (const b of newBlocks) {
    newMap[b.id] = b.props?.animation
    const prev = oldMap[b.id]
    const now = b.props?.animation
    if (prev !== undefined && prev !== now) {
      // reset trigger for this block
      triggeredBlocks.value.delete(b.id)
      // re-observe the element so intersection observer can trigger again
      const el = wrapperRefs.value[b.id]
      if (el && observer) {
        try { observer.observe(el) } catch (e) {}
      }
    }
  }
  lastAnimations.value = newMap
}, { deep: true })

function observeElements() {
  if (!observer) return
  for (const [id, el] of Object.entries(wrapperRefs.value)) {
    if (el) {
      el.dataset.blockId = id
      observer.observe(el)
    }
  }
}

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.page-renderer {
  width: 100%;
}
.block-wrapper {
  /* Pas de contain: layout — ça casse les transitions GPU */
}
.admin-selected {
  outline: 2px solid #3B82F6;
  outline-offset: -2px;
}
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
