<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { getDefaultErrorPage } from '~/utils/blockTypes.js'

useSeoMeta({
  title: '500 — Erreur serveur',
  description: "Désolé, une erreur inattendue s'est produite.",
})

const { isAdminMode, enterAdmin, localBlocks } = useAdmin()

const { data: pageData } = await useFetch('/api/pages/error-500', {
  key: 'page-error-500',
  server: true,
})

const blocks = computed(() => {
  if (isAdminMode.value && localBlocks.value.length) {
    return localBlocks.value
  }
  if (pageData.value?.blocks?.length) {
    return pageData.value.blocks
  }
  return getDefaultErrorPage(500)
})

watch(() => isAdminMode.value, (val) => {
  if (val && pageData.value?.blocks?.length) {
    enterAdmin(pageData.value.blocks)
  } else if (val) {
    enterAdmin(getDefaultErrorPage(500))
  }
}, { immediate: true })
</script>
