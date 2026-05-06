<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { getDefaultContactPage, normalizePageBlocks } from '~/utils/blockTypes.js'

useSeoMeta({
  title: 'Contact — Église Cieux Ouverts Morlaix',
  description: 'Contactez l\'Église Cieux Ouverts à Morlaix. 2 rue Jean Monnet, 29600 Morlaix.',
})

const blocks = ref(getDefaultContactPage())
const { $db } = useNuxtApp()

onMounted(async () => {
  try {
    if (!$db) return
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc($db, 'pages', 'contact'))
    if (snap.exists() && snap.data().blocks?.length) {
      blocks.value = normalizePageBlocks('contact', snap.data().blocks)
    }
  } catch (e) {
    console.error('Erreur chargement page contact:', e)
  }
})
</script>
