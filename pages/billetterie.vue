<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { getDefaultBilletteriePage } from '~/utils/blockTypes.js'

useSeoMeta({
  title: 'Billetterie — Église Cieux Ouverts Morlaix',
  description: 'Réservez vos places pour nos événements.',
})

const { isAdminMode, enterAdmin, localBlocks } = useAdmin()

const { data: pageData } = await useFetch('/api/pages/billetterie', {
  key: 'page-billetterie',
  server: true,
})

const blocks = computed(() => {
  if (isAdminMode.value && localBlocks.value.length) {
    return localBlocks.value
  }
  if (pageData.value?.blocks?.length) {
    return pageData.value.blocks
  }
  return getDefaultBilletteriePage()
})

watch(() => isAdminMode.value, (val) => {
  if (val && pageData.value?.blocks?.length) {
    enterAdmin(pageData.value.blocks)
  } else if (val) {
    enterAdmin(getDefaultBilletteriePage())
  }
}, { immediate: true })
</script>
