// Composable partagé : charge les événements depuis Firebase
// Utilisé par SiteHeader, agenda public et l'admin

export function useEvenements(options = {}) {
  const { $db } = useNuxtApp()
  const evenements = ref([])
  const loading = ref(true)
  const futureOnly = options.futureOnly !== false

  async function loadEvenements() {
    loading.value = true
    try {
      const { collection, getDocs, query, where, orderBy, Timestamp } = await import('firebase/firestore')
      const collectionRef = collection($db, 'evenements')
      const q = futureOnly
        ? query(collectionRef, where('date', '>=', Timestamp.now()), orderBy('date', 'asc'))
        : query(collectionRef, orderBy('date', 'asc'))
      const snap = await getDocs(q)
      evenements.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (e) {
      console.error('useEvenements:', e)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadEvenements()
  })

  const hasEvenements = computed(() => evenements.value.length > 0)

  return { evenements, loading, hasEvenements, refresh: loadEvenements }
}
