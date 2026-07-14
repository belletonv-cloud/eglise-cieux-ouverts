<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { getDefaultBilletteriePage } from '~/utils/blockTypes.js'

useSeoMeta({
  title: 'Événements — Église Cieux Ouverts Morlaix',
  description: 'Découvrez et réservez vos places pour nos événements.',
})

const { isAdminMode, enterAdmin, localBlocks, localBlocksPage } = useAdmin()
const router = useRouter()

// Vérifier si la page Événements doit être masquée
const { data: settingsData } = await useFetch('/api/settings')
const showEventsPage = computed(() => settingsData.value?.showEventsPage !== false)

onMounted(() => {
  if (!isAdminMode.value && !showEventsPage.value) {
    router.push('/')
  }
})

// On utilise useFetch au lieu de useLazyFetch pour que les données
// soient sérialisées dans le payload Nuxt et disponibles côté client
// après hydratation. useLazyFetch ne sérialise pas les données, ce qui
// empêche les mocks de fonctionner dans les tests Playwright admin.
const { data: pageData } = await useFetch('/api/pages/event-list')

const blocks = computed(() => {
  if (isAdminMode.value && localBlocks.value.length && localBlocksPage.value === 'event-list') {
    return localBlocks.value
  }
  if (pageData.value?.blocks?.length) {
    return pageData.value.blocks
  }
  return getDefaultBilletteriePage()
})

function initAdminBlocks() {
  if (!isAdminMode.value) return
  if (pageData.value?.blocks?.length) {
    enterAdmin(pageData.value.blocks, 'event-list')
  } else {
    enterAdmin(getDefaultBilletteriePage(), 'event-list')
  }
}

watch(() => isAdminMode.value, initAdminBlocks, { immediate: true })
watch(pageData, () => {
  if (isAdminMode.value) initAdminBlocks()
})
</script>
