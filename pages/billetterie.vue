<template>
  <PageRenderer :blocks="blocks" />
</template>

<script setup>
import { getDefaultBilletteriePage } from '~/utils/blockTypes.js'

useHead({
  title: 'Billetterie — Église Cieux Ouverts'
})

const blocks = ref(getDefaultBilletteriePage())
const { $db } = useNuxtApp()

onMounted(async () => {
  try {
    if (!$db) return
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc($db, 'pages', 'billetterie'))
    if (snap.exists() && snap.data().blocks?.length) {
      blocks.value = snap.data().blocks
    }
  } catch (e) {
    console.error('Erreur chargement page billetterie:', e)
  }
})
</script>
