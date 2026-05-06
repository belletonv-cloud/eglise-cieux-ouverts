// Composable partagé : charge les événements futurs depuis Firebase
// Utilisé par SiteHeader (pour masquer le lien billetterie) et pages/billetterie.vue

export function useEvenements() {
  const { $db } = useNuxtApp()
  const evenements = ref([])
  const loading = ref(true)

  onMounted(async () => {
    try {
      const { collection, getDocs, query, where, orderBy, Timestamp } = await import('firebase/firestore')
      const now = Timestamp.now()
      const q = query(
        collection($db, 'evenements'),
        where('date', '>=', now),
        orderBy('date', 'asc')
      )
      const snap = await getDocs(q)
      evenements.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (e) {
      console.error('useEvenements:', e)
    } finally {
      loading.value = false
    }
  })

  const hasEvenements = computed(() => evenements.value.length > 0)

  return { evenements, loading, hasEvenements }
}
