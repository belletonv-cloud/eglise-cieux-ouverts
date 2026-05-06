<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { getDefaultPhotosPage } from '~/utils/blockTypes.js'

useHead({
  title: 'Photos — Église Cieux Ouverts'
})

const blocks = ref(getDefaultPhotosPage())
const { $db } = useNuxtApp()

onMounted(async () => {
  try {
    if (!$db) return
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc($db, 'pages', 'photos'))
    if (snap.exists() && snap.data().blocks?.length) {
      blocks.value = snap.data().blocks
    }
  } catch (e) {
    console.error('Erreur chargement page photos:', e)
  }
})
</script>
