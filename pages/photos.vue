<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { getDefaultPhotosPage } from '~/utils/blockTypes.js'

useSeoMeta({
  title: 'Photos — Église Cieux Ouverts Morlaix',
  description: 'Galerie photos de l\'Église Cieux Ouverts à Morlaix.',
})

const { isAdminMode, enterAdmin, localBlocks } = useAdmin()

const { data: pageData } = await useFetch('/api/pages/photos', {
  key: 'page-photos',
  server: true,
})

const blocks = computed(() => {
  if (isAdminMode.value && localBlocks.value.length) {
    return localBlocks.value
  }
  if (pageData.value?.blocks?.length) {
    return pageData.value.blocks
  }
  return getDefaultPhotosPage()
})

function initAdminBlocks() {
  if (!isAdminMode.value) return
  if (pageData.value?.blocks?.length) {
    enterAdmin(pageData.value.blocks)
  } else {
    enterAdmin(getDefaultPhotosPage())
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
