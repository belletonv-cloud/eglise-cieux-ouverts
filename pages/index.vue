<template>
  <div>
    <PageRenderer :blocks="blocks" />
  </div>
</template>

<script setup>
import { getDefaultHomePage } from '~/utils/blockTypes.js'

// Initialiser directement avec les valeurs par défaut au lieu de le faire dans onMounted
// pour avoir un rendu côté serveur (SSR) et éviter la page blanche.
const blocks = ref(getDefaultHomePage())

onMounted(async () => {
  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const { $db } = useNuxtApp()
    if ($db) {
      const snap = await getDoc(doc($db, 'pages', 'accueil'))
      if (snap.exists() && snap.data().blocks?.length) {
        blocks.value = snap.data().blocks
      }
    }
  } catch (e) {
    console.error('Erreur chargement page:', e)
  }
})
</script>
