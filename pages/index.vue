<template>
  <div>
    <PageRenderer :blocks="blocks" />
  </div>
</template>

<script setup>
import { getDefaultHomePage } from '~/utils/blockTypes.js'

// Charger les blocs immédiatement avec les défauts,
// puis remplacer si Firebase a des données
const blocks = ref(getDefaultHomePage())

const { $db } = useNuxtApp()

onMounted(async () => {
  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc($db, 'pages', 'accueil'))
    if (snap.exists() && snap.data().blocks?.length) {
      blocks.value = snap.data().blocks
    }
    // sinon on garde les défauts déjà affichés
  } catch (e) {
    console.error('Erreur chargement page:', e)
    // on garde les défauts
  }
})
</script>
