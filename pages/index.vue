<template>
  <div>
    <PageRenderer :blocks="blocks" />
  </div>
</template>

<script setup>
import { getDefaultHomePage } from '~/utils/blockTypes.js'

const blocks = ref(getDefaultHomePage())
const { $db } = useNuxtApp()

onMounted(async () => {
  try {
    if (!$db) return
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc($db, 'pages', 'accueil'))
    if (snap.exists() && snap.data().blocks?.length) {
      blocks.value = snap.data().blocks
    }
  } catch (e) {
    console.error('Erreur chargement page:', e)
  }
})
</script>
