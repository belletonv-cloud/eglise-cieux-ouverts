<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { getDefaultBilletteriePage } from '~/utils/blockTypes.js'

useSeoMeta({
  title: 'Billetterie — Église Cieux Ouverts Morlaix',
  description: 'Réservez vos places pour nos événements.',
})

const { data: pageData } = await useFetch('/api/pages/billetterie', {
  key: 'page-billetterie',
  server: true,
})

const blocks = computed(() => {
  if (pageData.value?.blocks?.length) {
    return pageData.value.blocks
  }
  return getDefaultBilletteriePage()
})
</script>
