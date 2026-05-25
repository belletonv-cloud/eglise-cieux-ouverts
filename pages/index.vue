<template>
  <div>
    <PageRenderer :blocks="blocks" />
  </div>
</template>

<script setup>
import { getDefaultHomePage } from '~/utils/blockTypes.js'

useSeoMeta({
  title: 'Église Cieux Ouverts — Morlaix',
  ogTitle: 'Église Cieux Ouverts — Morlaix',
  description: 'Bienvenue à l\'Église Cieux Ouverts à Morlaix. Découvrez nos événements, cultes et activités.',
  ogDescription: 'Bienvenue à l\'Église Cieux Ouverts à Morlaix. Découvrez nos événements, cultes et activités.',
  ogImage: 'https://static.wixstatic.com/media/d65230_2d9fe5fd35e84c55b202fcf057c136b5~mv2.jpg',
  ogUrl: 'https://eglise-cieux-ouverts.pages.dev',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

const { isAdminMode, enterAdmin, localBlocks } = useAdmin()
const route = useRoute()

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
  // Allow pages to initialize admin blocks when the admin query is present
  // because route query may be set before the global isAdminMode flag is
  // toggled in the layout. We prefer a pragmatic approach: if either the
  // composable flag or the URL indicates admin mode, initialize local blocks.
  const shouldInit = isAdminMode.value || (import.meta.client && route.query.admin === 'true')
  if (!shouldInit) return
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

// Debug: log admin boot flow (Playwright traces)
try { if (import.meta.env.DEV) console.debug('pages/index: isAdminMode on load=', isAdminMode.value, 'pageDataBlocks=', pageData?.value?.blocks?.length) } catch (e) {}
</script>
