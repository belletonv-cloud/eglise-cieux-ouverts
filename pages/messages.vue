<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { getDefaultMessagesPage, normalizePageBlocks } from '~/utils/blockTypes.js'

useSeoMeta({
  title: 'Messages — Église Cieux Ouverts Morlaix',
  description: 'Retrouvez les messages et prédications de l\'Église Cieux Ouverts.',
})

const { isAdminMode, enterAdmin, localBlocks, localBlocksPage } = useAdmin()

const { data: pageBlocks } = await useAsyncData('page-messages-blocks', async () => {
  const data = await $fetch('/api/pages/messages').catch(() => ({ blocks: [] }))
  return data?.blocks?.length ? normalizePageBlocks('messages', data.blocks) : getDefaultMessagesPage()
})

const blocks = computed(() => {
  if (isAdminMode.value && localBlocks.value.length && localBlocksPage.value === 'messages') {
    return localBlocks.value
  }
  return pageBlocks.value || []
})

function initAdminBlocks() {
  if (!isAdminMode.value) return
  enterAdmin(pageBlocks.value?.length ? pageBlocks.value : getDefaultMessagesPage(), 'messages')
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
