<template>
  <div>
    <PageRenderer :blocks="blocks" />
  </div>
</template>

<script setup>
import { getDefaultHomePage } from '~/utils/blockTypes.js'

const { data: pageData } = await useFetch('/api/pages/accueil', {
  key: 'page-accueil',
  server: true,
})

const blocks = computed(() => {
  if (pageData.value?.blocks?.length) {
    return pageData.value.blocks
  }
  return getDefaultHomePage()
})
</script>
