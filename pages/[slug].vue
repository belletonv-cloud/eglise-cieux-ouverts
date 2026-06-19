<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { normalizePageBlocks } from '~/utils/blockTypes.js'

const route = useRoute()
const slug = computed(() => {
  const s = route.params.slug
  return Array.isArray(s) ? s[0] : s || ''
})

useSeoMeta({
  title: computed(() => `${slug.value.charAt(0).toUpperCase() + slug.value.slice(1)} — Église Cieux Ouverts Morlaix`),
})

const { isAdminMode, enterAdmin, localBlocks, localBlocksPage } = useAdmin()

const { data: pageBlocks } = await useAsyncData(`page-${slug.value}-blocks`, async () => {
  const data = await $fetch(`/api/pages/${slug.value}`).catch(() => ({ blocks: [] }))
  return data?.blocks?.length ? normalizePageBlocks(slug.value, data.blocks) : []
})

const blocks = computed(() => {
  if (isAdminMode.value && localBlocks.value.length && localBlocksPage.value === slug.value) {
    return localBlocks.value
  }
  return pageBlocks.value?.length ? pageBlocks.value : []
})

function initAdminBlocks() {
  if (!isAdminMode.value) return
  enterAdmin(pageBlocks.value?.length ? pageBlocks.value : [], slug.value)
}

watch(() => isAdminMode.value, () => {
  initAdminBlocks()
}, { immediate: true })

watch(pageBlocks, () => {
  if (isAdminMode.value) initAdminBlocks()
})
</script>
