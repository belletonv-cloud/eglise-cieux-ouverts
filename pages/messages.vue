<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { getDefaultMessagesPage, normalizePageBlocks } from '~/utils/blockTypes.js'

useSeoMeta({
  title: 'Messages — Église Cieux Ouverts Morlaix',
  description: 'Retrouvez les messages et prédications de l\'Église Cieux Ouverts.',
})

const { data: pageData } = await useFetch('/api/pages/messages', {
  key: 'page-messages',
  server: true,
})

const blocks = computed(() => {
  if (pageData.value?.blocks?.length) {
    return normalizePageBlocks('messages', pageData.value.blocks)
  }
  return getDefaultMessagesPage()
})
</script>
