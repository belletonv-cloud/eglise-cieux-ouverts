<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { getDefaultErrorPage } from '~/utils/blockTypes.js'

useSeoMeta({
  title: '503 — Service indisponible',
  description: 'Le site est momentanément indisponible.',
})

const { isAdminMode, enterAdmin, localBlocks } = useAdmin()

const { data: pageData } = await useFetch('/api/pages/error-503', {
  key: 'page-error-503',
  server: true,
})

const blocks = computed(() => {
  if (isAdminMode.value && localBlocks.value.length) {
    return localBlocks.value
  }
  if (pageData.value?.blocks?.length) {
    return pageData.value.blocks
  }
  return getDefaultErrorPage(503)
})

watch(() => isAdminMode.value, (val) => {
  if (val && pageData.value?.blocks?.length) {
    enterAdmin(pageData.value.blocks)
  } else if (val) {
    enterAdmin(getDefaultErrorPage(503))
  }
}, { immediate: true })
</script>
