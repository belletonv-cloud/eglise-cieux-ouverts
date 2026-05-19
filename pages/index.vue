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

function initAdminBlocks() {
  if (!isAdminMode.value) return
  if (pageData.value?.blocks?.length) {
    enterAdmin(pageData.value.blocks)
  } else {
    enterAdmin(getDefaultHomePage())
  }
}

// Watch admin mode changes (initial load + toggling)
watch(() => isAdminMode.value, () => {
  initAdminBlocks()
}, { immediate: true })

// Also watch pageData to catch late-arriving data after client-side navigation
watch(pageData, () => {
  if (isAdminMode.value) {
    initAdminBlocks()
  }
})
</script>
