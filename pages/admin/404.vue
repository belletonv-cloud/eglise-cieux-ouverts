<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { getDefaultErrorPage } from '~/utils/blockTypes.js'

useSeoMeta({
  title: '404 — Page introuvable',
  description: "La page que vous cherchez n'existe pas ou a été déplacée.",
})

const { isAdminMode, enterAdmin, localBlocks } = useAdmin()

const { data: pageData } = await useFetch('/api/pages/error-404', {
  key: 'page-error-404',
  server: true,
})

const blocks = computed(() => {
  if (isAdminMode.value && localBlocks.value.length) {
    return localBlocks.value
  }
  if (pageData.value?.blocks?.length) {
    return pageData.value.blocks
  }
  return getDefaultErrorPage(404)
})

watch(() => isAdminMode.value, (val) => {
  if (val && pageData.value?.blocks?.length) {
    enterAdmin(pageData.value.blocks)
  } else if (val) {
    enterAdmin(getDefaultErrorPage(404))
  }
}, { immediate: true })
</script>
