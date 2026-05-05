<template>
  <div>
    <PageRenderer :blocks="blocks" />
  </div>
</template>

<script setup>
import { getDefaultHomePage } from '~/utils/blockTypes.js'

// Initialiser directement avec les valeurs par défaut
const blocks = ref(getDefaultHomePage())

onMounted(async () => {
  // Commenté temporairement pour forcer l'affichage de la structure mise à jour
  /*
  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const { $db } = useNuxtApp()
    if ($db) {
      const snap = await getDoc(doc($db, 'pages', 'accueil'))
      if (snap.exists() && snap.data().blocks?.length) {
        // blocks.value = snap.data().blocks
      }
    }
  } catch (e) {
    console.error('Erreur chargement page:', e)
  }
  */
})
</script>
