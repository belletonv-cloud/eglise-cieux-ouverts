<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { computed, watch } from 'vue'
import { getDefaultBilletteriePage } from '~/utils/blockTypes.js'

useSeoMeta({
  title: 'Événements — Église Cieux Ouverts Morlaix',
  description: 'Découvrez et réservez vos places pour nos événements.',
})

const { isAdminMode, enterAdmin, localBlocks, localBlocksPage } = useAdmin()

// Masquer la page si aucun événement à venir n'est publié (option admin),
// sauf en mode admin où elle reste accessible pour la gestion du contenu.
const { data: settingsData } = await useFetch('/api/settings')
const hideIfEmpty = computed(() => settingsData.value?.hideEventsPageIfEmpty === true)
const { hasEvenements, loading: eventsLoading, erreur: eventsErreur } = useChurchEvents()

watch([isAdminMode, hideIfEmpty, hasEvenements, eventsLoading, eventsErreur], () => {
  if (isAdminMode.value || eventsLoading.value) return
  // Ne jamais masquer la page sur une ERREUR de chargement : « aucun événement
  // publié » et « le Worker événements n'a pas répondu » donnent la même liste
  // vide, mais seul le premier cas justifie de retirer la page du site. Sans
  // cette distinction, une panne passagère de l'amont faisait disparaître
  // Événements, sans que rien ne le signale.
  if (eventsErreur.value) return
  if (hideIfEmpty.value && !hasEvenements.value) {
    // navigateTo (pas router.push) : sur un premier chargement direct de
    // /event-list, useChurchEvents() ne résout (onMounted, client-only)
    // qu'après hydratation — ce watcher peut donc se déclencher une seule
    // fois post-hydratation, en plein contexte Nuxt. router.push() y
    // fonctionne, mais navigateTo() est la primitive Nuxt correcte ici
    // (gère aussi le cas SSR si jamais ce timing venait à changer).
    navigateTo('/')
  }
}, { immediate: true })

// On utilise useFetch au lieu de useLazyFetch pour que les données
// soient sérialisées dans le payload Nuxt et disponibles côté client
// après hydratation. useLazyFetch ne sérialise pas les données, ce qui
// empêche les mocks de fonctionner dans les tests Playwright admin.
// `error` de useFetch sert ici de signal d'échec de LECTURE : sans lui, une
// lecture ratée donne `pageData = null`, la page se rabat sur ses defaults, et
// en admin l'auto-save les écrirait par-dessus le vrai contenu. Voir
// `contenuNonCharge` dans useAdmin.js.
const { data: pageData, error: pageError } = await useFetch('/api/pages/event-list')

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
  const contenuCharge = !pageError.value
  if (pageData.value?.blocks?.length) {
    enterAdmin(pageData.value.blocks, 'event-list', contenuCharge)
  } else {
    enterAdmin(getDefaultBilletteriePage(), 'event-list', contenuCharge)
  }
}

watch(() => isAdminMode.value, initAdminBlocks, { immediate: true })
watch(pageData, () => {
  if (isAdminMode.value) initAdminBlocks()
})
</script>
