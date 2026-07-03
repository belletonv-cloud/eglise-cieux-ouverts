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

  function getNthWeekdayOfMonth(year, month, weekday, ordinal) {
    if (ordinal === -1) {
      const last = new Date(year, month + 1, 0)
      const diff = (last.getDay() - weekday + 7) % 7
      return new Date(year, month, last.getDate() - diff)
    }
    const first = new Date(year, month, 1)
    const diff  = (weekday - first.getDay() + 7) % 7
    const date  = 1 + diff + (ordinal - 1) * 7
    if (date > new Date(year, month + 1, 0).getDate()) return null
    return new Date(year, month, date)
  }

  function expandRecurring(ev, now, maxCount) {
    const rp    = ev.repeat_period
    const start = new Date(ev.start_date + 'T00:00:00')
    const results = []

    // Multi-rule: '|'-separated, expand each and merge
    if (rp.includes('|')) {
      const allResults = []
      for (const ruleStr of rp.split('|').filter(Boolean)) {
        const tempEv = { ...ev, repeat_period: ruleStr }
        allResults.push(...expandRecurring(tempEv, now, maxCount))
      }
      allResults.sort((a, b) => a.date - b.date)
      const seen = new Set()
      const unique = []
      for (const r of allResults) {
        const key = r.date.toISOString().slice(0, 10)
        if (!seen.has(key)) { seen.add(key); unique.push(r) }
      }
      return unique.slice(0, maxCount)
    }

    if (rp === 'month') {
      let d = new Date(start)
      while (d < now) d.setMonth(d.getMonth() + 1)
      let count = 0, safety = 0
      while (count < maxCount && safety++ < 500) {
        const dateStr = d.toISOString().slice(0, 10)
        if (!isException(ev, dateStr, 'cancelled')) {
          const moved = getException(ev, dateStr, 'moved')
          results.push(mapEvent(ev, moved ? new Date(moved.new_date + 'T00:00:00') : new Date(d)))
          count++
        }
        d.setMonth(d.getMonth() + 1)
      }

    } else if (rp === 'week' || rp === 'biweek' || rp.startsWith('weekly:') || rp.startsWith('biweekly:')) {
      let days, interval
      if      (rp === 'week')              { days = [start.getDay()]; interval = 1 }
      else if (rp === 'biweek')            { days = [start.getDay()]; interval = 2 }
      else if (rp.startsWith('weekly:'))   { days = rp.split(':')[1].split(',').map(Number); interval = 1 }
      else                                 { days = rp.split(':')[1].split(',').map(Number); interval = 2 }
      days.sort((a, b) => a - b)

      // Lundi de la semaine de start_date
      const dow = start.getDay()
      const startMon = new Date(start)
      startMon.setDate(start.getDate() - (dow === 0 ? 6 : dow - 1))
      let curMon = new Date(startMon)
      let count = 0, safety = 0
      while (count < maxCount && safety++ < 500) {
        for (const day of days) {
          const offset = day === 0 ? 6 : day - 1
          const date = new Date(curMon)
          date.setDate(curMon.getDate() + offset)
          if (date >= now && date >= start) {
            const dateStr = date.toISOString().slice(0, 10)
            if (!isException(ev, dateStr, 'cancelled')) {
              const moved = getException(ev, dateStr, 'moved')
              results.push(mapEvent(ev, moved ? new Date(moved.new_date + 'T00:00:00') : new Date(date)))
              count++
            }
          }
        }
        curMon.setDate(curMon.getDate() + 7 * interval)
      }
      results.sort((a, b) => a.date - b.date)
      results.splice(maxCount)

    } else if (rp.startsWith('monthly_weekday:')) {
      const p = rp.split(':')
      const ordinal = parseInt(p[1]) || 1
      const weekday = parseInt(p[2]) ?? 1
      // Chercher à partir du mois précédent pour ne pas rater le mois courant
      let year = now.getFullYear(), month = now.getMonth()
      if (month === 0) { month = 11; year-- } else { month-- }
      let count = 0, safety = 0
      while (count < maxCount && safety++ < 200) {
        const occ = getNthWeekdayOfMonth(year, month, weekday, ordinal)
        if (occ && occ >= now) {
          const dateStr = occ.toISOString().slice(0, 10)
          if (!isException(ev, dateStr, 'cancelled')) {
            const moved = getException(ev, dateStr, 'moved')
            results.push(mapEvent(ev, moved ? new Date(moved.new_date + 'T00:00:00') : new Date(occ)))
            count++
          }
        }
        if (++month > 11) { month = 0; year++ }
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
