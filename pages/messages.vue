<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { getDefaultMessagesPage, normalizePageBlocks } from '~/utils/blockTypes.js'

useSeoMeta({
  title: 'Messages — Église Cieux Ouverts Morlaix',
  description: 'Retrouvez les messages et prédications de l\'Église Cieux Ouverts.',
})

const { isAdminMode, enterAdmin, localBlocks } = useAdmin()

const { data: pageData } = useLazyFetch('/api/pages/messages', {
  key: 'page-messages',
  server: true,
})

const blocks = computed(() => {
  if (isAdminMode.value && localBlocks.value.length) {
    return localBlocks.value
  }
  if (pageData.value?.blocks?.length) {
    return normalizePageBlocks('messages', pageData.value.blocks)
  }
  return getDefaultMessagesPage()
})

function initAdminBlocks() {
  if (!isAdminMode.value) return
  if (pageData.value?.blocks?.length) {
    enterAdmin(normalizePageBlocks('messages', pageData.value.blocks))
  } else {
    enterAdmin(getDefaultMessagesPage())
  }
}

watch(() => isAdminMode.value, () => {
  initAdminBlocks()
}, { immediate: true })

watch(pageData, () => {
  if (isAdminMode.value) {
    initAdminBlocks()
  }
})
</script>
