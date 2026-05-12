<template>
  <div class="page-renderer" :class="{ 'preview-mode': previewDevice !== 'desktop' }">
    <div 
      v-for="block in visibleBlocks" 
      :key="block.id"
      class="block-wrapper"
      :class="[getAnimClass(block.props), { triggered: isTriggered(block.id) }]"
      :ref="el => setWrapperRef(el, block.id)"
    >
      <component
        :is="blockComponent(block.type)"
        v-bind="block.props"
        :visibility="block.visibility"
        :is-triggered="isTriggered(block.id)"
        :preview-device="previewDevice"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, watch, nextTick } from 'vue'
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
  previewDevice: { type: String, default: 'desktop' },
})

function blockComponent(type) {
  return COMPONENTS[type] || BlockRichText
}

const visibleBlocks = computed(() => {
  return props.blocks.filter(block => {
    const v = block.visibility || {}
    if (props.previewDevice === 'mobile' && v.mobile === false) return false
    if (props.previewDevice === 'tablet' && v.tablet === false) return false
    if (props.previewDevice === 'desktop' && v.desktop === false) return false
    return true
  })
})

function getAnimClass(p) {
  if (!p || !p.animation || p.animation === 'none') return ''
  const anim = ANIMATIONS.find(a => a.id === p.animation)
  return anim ? `block-${anim.css}` : ''
}

const triggeredBlocks = ref(new Set())
const wrapperRefs = ref({})

function isTriggered(id) {
  return triggeredBlocks.value.has(id)
}

function setWrapperRef(el, id) {
  if (el) wrapperRefs.value[id] = el
}

let observer = null

onMounted(() => {
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
})

watch(() => props.blocks, async () => {
  await nextTick()
  observeElements()
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

</style>
