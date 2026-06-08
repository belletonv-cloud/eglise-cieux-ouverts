<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { getDefaultContactPage, normalizePageBlocks } from '~/utils/blockTypes.js'

useSeoMeta({
  title: 'Contact — Église Cieux Ouverts Morlaix',
  description: 'Contactez l\'Église Cieux Ouverts à Morlaix. 2 rue Jean Monnet, 29600 Morlaix.',
})

const { isAdminMode, enterAdmin, localBlocks, localBlocksPage } = useAdmin()

const { data: pageBlocks } = await useAsyncData('page-contact-blocks', async () => {
  const data = await $fetch('/api/pages/contact').catch(() => ({ blocks: [] }))
  return data?.blocks?.length ? normalizePageBlocks('contact', data.blocks) : getDefaultContactPage()
})

const blocks = computed(() => {
  if (isAdminMode.value && localBlocks.value.length && localBlocksPage.value === 'contact') {
    return localBlocks.value
  }
  return pageBlocks.value || []
})

function initAdminBlocks() {
  if (!isAdminMode.value) return
  enterAdmin(pageBlocks.value?.length ? pageBlocks.value : getDefaultContactPage(), 'contact')
}

watch(() => isAdminMode.value, () => {
  initAdminBlocks()
}, { immediate: true })

watch(pageBlocks, () => {
  if (isAdminMode.value) {
    initAdminBlocks()
  }
})
</script>
