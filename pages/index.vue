<template>
  <div>
    <PageRenderer :blocks="blocks" />
  </div>
</template>

<script setup>
import { getDefaultHomePage } from '~/utils/blockTypes.js'

const { isAdminMode, enterAdmin, localBlocks } = useAdmin()

const { data: pageData } = await useFetch('/api/pages/accueil', {
  key: 'page-accueil',
  server: true,
})

const blocks = computed(() => {
  if (isAdminMode.value && localBlocks.value.length) {
    return localBlocks.value
  }
  if (pageData.value?.blocks?.length) {
    return pageData.value.blocks
  }
  return getDefaultHomePage()
})

watch(() => isAdminMode.value, (val) => {
  if (val && pageData.value?.blocks?.length) {
    enterAdmin(pageData.value.blocks)
  } else if (val) {
    enterAdmin(getDefaultHomePage())
  }
}, { immediate: true })
</script>
