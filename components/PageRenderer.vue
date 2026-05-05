<template>
  <div class="page-renderer" :class="{ 'preview-mode': previewDevice !== 'desktop' }">
    <component
      v-for="block in visibleBlocks"
      :key="block.id"
      :is="blockComponent(block.type)"
      :props="block.props"
      :visibility="block.visibility"
    />
  </div>
</template>

<script setup>
import BlockHero from '~/components/blocks/BlockHero.vue'
import BlockBienvenue from '~/components/blocks/BlockBienvenue.vue'
import BlockRejoins from '~/components/blocks/BlockRejoins.vue'
import BlockAspirations from '~/components/blocks/BlockAspirations.vue'
import BlockContact from '~/components/blocks/BlockContact.vue'
import BlockRichText from '~/components/blocks/BlockRichText.vue'
import BlockFullWidthImage from '~/components/blocks/BlockFullWidthImage.vue'

const COMPONENTS = {
  hero: BlockHero,
  bienvenue: BlockBienvenue,
  rejoins: BlockRejoins,
  aspirations: BlockAspirations,
  contact: BlockContact,
  richText: BlockRichText,
  fullWidthImage: BlockFullWidthImage,
}

const props = defineProps({
  blocks: { type: Array, default: () => [] },
  previewDevice: { type: String, default: 'desktop' }, // 'desktop' | 'tablet' | 'mobile'
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
</script>

<style scoped>
.page-renderer {
  width: 100%;
}
</style>
