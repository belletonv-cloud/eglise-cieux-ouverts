<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { getDefaultMessagesPage, normalizePageBlocks } from '~/utils/blockTypes.js'

useHead({
  title: 'Messages — Église Cieux Ouverts'
})

const blocks = ref(getDefaultMessagesPage())
const { $db } = useNuxtApp()

onMounted(async () => {
  try {
    if (!$db) return
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc($db, 'pages', 'messages'))
    if (snap.exists() && snap.data().blocks?.length) {
      blocks.value = normalizePageBlocks('messages', snap.data().blocks)
    }
  } catch (e) {
    console.error('Erreur chargement page messages:', e)
  }
})
</script>
