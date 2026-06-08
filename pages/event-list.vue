<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { computed } from 'vue'
import { getDefaultBilletteriePage } from '~/utils/blockTypes.js'

useSeoMeta({
  title: 'Événements — Église Cieux Ouverts Morlaix',
  description: 'Découvrez et réservez vos places pour nos événements.',
})

const { isAdminMode, enterAdmin, localBlocks, localBlocksPage } = useAdmin()

// useLazyFetch ne bloque pas le rendu : le fallback s'affiche immédiatement,
// même pendant la navigation SPA. Le fetch se fait en arrière-plan.
const { data: pageData } = useLazyFetch('/api/pages/event-list', {
  server: true,
})

const blocks = computed(() => {
  if (isAdminMode.value && localBlocks.value.length && localBlocksPage.value === 'event-list') {
    return localBlocks.value
  }
  if (pageData.value?.blocks?.length) {
    return pageData.value.blocks
  }
  return getDefaultBilletteriePage()
})

function initAdminBlocks() {
  if (!isAdminMode.value) return
  if (pageData.value?.blocks?.length) {
    enterAdmin(pageData.value.blocks, 'event-list')
  } else {
    enterAdmin(getDefaultBilletteriePage(), 'event-list')
  }
}

watch(() => isAdminMode.value, initAdminBlocks, { immediate: true })
watch(pageData, () => {
  if (isAdminMode.value) initAdminBlocks()
})
</script>
