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

// /api/pages/:slug renvoie exists:false pour un slug vraiment inconnu (pas
// de document Firestore, ou soft-deleted). Les pages statiques (contact,
// agenda, etc.) ont leur propre fichier et ne passent jamais par cette
// route dynamique, donc aucun risque de 404 sur elles ici. Les pages créées
// depuis l'admin (MenuEditor.createPage) sont POSTées avant la navigation :
// exists est donc toujours true au moment où [slug].vue les affiche.
const { data: pageData } = await useAsyncData(`page-${slug.value}-blocks`, async () => {
  const data = await $fetch(`/api/pages/${slug.value}`).catch(() => ({ blocks: [], exists: true }))
  return {
    exists: data?.exists !== false,
    blocks: data?.blocks?.length ? normalizePageBlocks(slug.value, data.blocks) : [],
  }
})

if (pageData.value?.exists === false) {
  throw createError({ statusCode: 404, statusMessage: 'Page introuvable' })
}

const blocks = computed(() => {
  if (isAdminMode.value && localBlocks.value.length && localBlocksPage.value === slug.value) {
    return localBlocks.value
  }
  return pageData.value?.blocks?.length ? pageData.value.blocks : []
})

function initAdminBlocks() {
  if (!isAdminMode.value) return
  enterAdmin(pageData.value?.blocks?.length ? pageData.value.blocks : [], slug.value)
}

watch(() => isAdminMode.value, () => {
  initAdminBlocks()
}, { immediate: true })

watch(pageData, () => {
  if (isAdminMode.value) initAdminBlocks()
})
</script>
