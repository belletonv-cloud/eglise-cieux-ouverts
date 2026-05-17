<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { getDefaultPhotosPage } from '~/utils/blockTypes.js'

useSeoMeta({
  title: 'Photos — Église Cieux Ouverts Morlaix',
  description: 'Galerie photos de l\'Église Cieux Ouverts.',
})

const { data: pageData } = await useFetch('/api/pages/photos', {
  key: 'page-photos',
  server: true,
})

const blocks = computed(() => {
  if (pageData.value?.blocks?.length) {
    return pageData.value.blocks
  }
  return getDefaultPhotosPage()
})
</script>
