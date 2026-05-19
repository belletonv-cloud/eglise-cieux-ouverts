<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { getDefaultContactPage, normalizePageBlocks } from '~/utils/blockTypes.js'

useSeoMeta({
  title: 'Contact — Église Cieux Ouverts Morlaix',
  description: 'Contactez l\'Église Cieux Ouverts à Morlaix. 2 rue Jean Monnet, 29600 Morlaix.',
})

const { isAdminMode, enterAdmin, localBlocks } = useAdmin()

const { data: pageData } = await useFetch('/api/pages/contact', {
  key: 'page-contact',
  server: true,
})

const blocks = computed(() => {
  if (isAdminMode.value && localBlocks.value.length) {
    return localBlocks.value
  }
  if (pageData.value?.blocks?.length) {
    return normalizePageBlocks('contact', pageData.value.blocks)
  }
  return getDefaultContactPage()
})

function initAdminBlocks() {
  if (!isAdminMode.value) return
  if (pageData.value?.blocks?.length) {
    enterAdmin(normalizePageBlocks('contact', pageData.value.blocks))
  } else {
    enterAdmin(getDefaultContactPage())
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
