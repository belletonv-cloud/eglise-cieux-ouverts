// Composable partagé : charge les événements depuis l'API eglise-app (D1)
// Utilisé par SiteHeader, agenda public et l'admin
// Remplace progressivement l'ancien composable Firebase

export function useChurchEvents(options = {}) {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl || 'https://eglise-app.belletonv.workers.dev'

  const evenements = ref([])
  const loading = ref(true)
  const futureOnly = options.futureOnly !== false

  async function loadEvenements() {
    loading.value = true
    try {
      const res = await fetch(`${apiUrl}/api/church-events?include_exceptions=1`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const allEvents = await res.json()

      const now = new Date()
      now.setHours(0, 0, 0, 0)
      const results = []

      for (const ev of allEvents) {
        // Ignorer les événements annulés
        if (ev.status === 'cancelled') continue

        if (ev.repeat_period) {
          // Événement récurrent — générer les occurrences futures
          const occurrences = expandRecurring(ev, now, 12)
          results.push(...occurrences)
        } else {
          // Événement ponctuel
          const evtDate = new Date(ev.start_date + 'T00:00:00')
          if (futureOnly && evtDate < now) continue
          results.push(mapEvent(ev, evtDate))
        }
      }

      // Trier par date
      results.sort((a, b) => a.date - b.date)
      evenements.value = results
    } catch (e) {
      console.error('useChurchEvents:', e)
      evenements.value = []
    } finally {
      loading.value = false
    }
  }

  function expandRecurring(ev, now, maxCount) {
    const start = new Date(ev.start_date + 'T00:00:00')
    const results = []
    let d = new Date(start)

    // Si la date de début est dans le passé, avancer jusqu'au futur
    if (d < now) {
      if (ev.repeat_period === 'week') {
        while (d < now) d.setDate(d.getDate() + 7)
      } else if (ev.repeat_period === 'month') {
        while (d < now) d.setMonth(d.getMonth() + 1)
      }
    }

    let count = 0
    while (count < maxCount) {
      const dateStr = d.toISOString().slice(0, 10)

      // Vérifier les exceptions (annulé ou déplacé) — maintenant chargées depuis l'API
      const cancelled = isException(ev, dateStr, 'cancelled')
      const moved = getException(ev, dateStr, 'moved')

      if (!cancelled) {
        const targetDate = moved ? new Date(moved.new_date + 'T00:00:00') : new Date(d)
        results.push(mapEvent(ev, targetDate))
        count++
      }

      // Avancer à la prochaine occurrence
      if (ev.repeat_period === 'week') {
        d.setDate(d.getDate() + 7)
      } else if (ev.repeat_period === 'month') {
        d.setMonth(d.getMonth() + 1)
      } else {
        break
      }
    }

    return results
  }

  function isException(ev, dateStr, type) {
    if (!ev.exceptions) return false
    return ev.exceptions.some(ex => ex.exception_date === dateStr && ex.type === type)
  }

  function getException(ev, dateStr, type) {
    if (!ev.exceptions) return null
    return ev.exceptions.find(ex => ex.exception_date === dateStr && ex.type === type) || null
  }

  function mapEvent(ev, date) {
    return {
      id: ev.id,
      titre: ev.title,
      date,
      heure: ev.start_time || null,
      lieu: ev.location || null,
      description: ev.description || null,
      source: ev.source || null,
      image_url: ev.image_url || null,
      images: ev.images ? ev.images : (ev.image_url ? [ev.image_url] : []),
      repeat_period: ev.repeat_period || null,
      lien: ev.lien || ev.link || null,
      billetterie: ev.billetterie || ev.ticket_url || null,
      emoji: ev.emoji || null,
    }
  }

  onMounted(() => {
    loadEvenements()
  })

  const hasEvenements = computed(() => evenements.value.length > 0)

  return { evenements, loading, hasEvenements, refresh: loadEvenements }
}
