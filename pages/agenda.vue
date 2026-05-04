<template>
  <div class="page-agenda">
    <div class="page-hero">
      <h1>Agenda</h1>
      <p>Retrouvez tous les événements à venir</p>
    </div>

    <section class="section">
      <div v-if="loading" class="loading">Chargement des événements...</div>

      <div v-else-if="evenements.length === 0" class="empty">
        <p>Aucun événement prévu pour l'instant. Revenez bientôt !</p>
      </div>

      <div v-else class="events-list">
        <article v-for="evt in evenements" :key="evt.id" class="event-card card">
          <div class="event-date-block">
            <span class="event-day">{{ formatDay(evt.date) }}</span>
            <span class="event-month">{{ formatMonth(evt.date) }}</span>
          </div>
          <div class="event-content">
            <h2 class="event-title">{{ evt.titre }}</h2>
            <div class="event-meta">
              <span v-if="evt.heure">🕙 {{ evt.heure }}</span>
              <span v-if="evt.lieu">📍 {{ evt.lieu }}</span>
            </div>
            <p v-if="evt.description" class="event-desc">{{ evt.description }}</p>
            <div v-if="evt.lien || evt.billetterie" class="event-links">
              <a v-if="evt.lien" :href="evt.lien" target="_blank" rel="noopener" class="btn btn-primary">En savoir plus</a>
              <a v-if="evt.billetterie" :href="evt.billetterie" target="_blank" rel="noopener" class="btn btn-outline-purple">🎟️ Billetterie</a>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Agenda — Église Cieux Ouverts Morlaix',
  description: 'Tous les événements à venir à l\'Église Cieux Ouverts de Morlaix.',
})

const { $db } = useNuxtApp()
const { collection, getDocs, orderBy, query, where, Timestamp } = await import('firebase/firestore')

const evenements = ref([])
const loading = ref(true)

function toDate(ts) {
  if (!ts) return new Date()
  return ts.toDate ? ts.toDate() : new Date(ts)
}
function formatDay(ts) {
  return toDate(ts).toLocaleDateString('fr-FR', { day: '2-digit' })
}
function formatMonth(ts) {
  return toDate(ts).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()
}

onMounted(async () => {
  try {
    const now = Timestamp.now()
    const q = query(
      collection($db, 'evenements'),
      where('date', '>=', now),
      orderBy('date', 'asc')
    )
    const snap = await getDocs(q)
    evenements.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-hero {
  background: var(--gradient-hero);
  color: white;
  text-align: center;
  padding: 80px 24px 60px;
}
.page-hero h1 { font-size: 2.8em; font-weight: 900; letter-spacing: 0.05em; margin-bottom: 12px; }
.page-hero p { font-size: 1.1em; opacity: 0.9; }

.loading, .empty { text-align: center; padding: 60px 0; color: var(--text-gray); font-size: 1.1em; }

.events-list { display: flex; flex-direction: column; gap: 20px; max-width: 800px; margin: 0 auto; }

.event-card { display: flex; gap: 28px; align-items: flex-start; }

.event-date-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  background: var(--gradient-accent);
  border-radius: 14px;
  padding: 12px 8px;
  color: white;
  flex-shrink: 0;
}

.event-day { font-size: 1.8em; font-weight: 900; line-height: 1; }
.event-month { font-size: 0.72em; font-weight: 700; letter-spacing: 0.06em; opacity: 0.9; }

.event-content { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.event-title { font-size: 1.2em; font-weight: 700; color: var(--text-dark); }
.event-meta { display: flex; gap: 16px; font-size: 0.88em; color: var(--text-gray); flex-wrap: wrap; }
.event-desc { font-size: 0.92em; color: var(--text-gray); line-height: 1.6; }
.event-links { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }

.btn-outline-purple {
  display: inline-block;
  padding: 10px 22px;
  border-radius: 50px;
  border: 2px solid var(--primary-purple);
  color: var(--primary-purple);
  font-weight: 600;
  font-size: 0.9em;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-outline-purple:hover { background: rgba(124,58,237,0.08); text-decoration: none; }

@media (max-width: 600px) {
  .event-card { flex-direction: column; gap: 14px; }
  .event-date-block { flex-direction: row; gap: 8px; padding: 10px 16px; align-self: flex-start; }
}
</style>
