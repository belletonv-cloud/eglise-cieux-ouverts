<template>
  <div class="page-agenda">
    <!-- Header -->
    <section class="agenda-header">
      <h1 class="agenda-title">Agenda</h1>
      <p class="agenda-subtitle">Retrouvez tous les événements à venir</p>
    </section>

    <!-- Calendar view -->
    <section class="agenda-calendar">
      <div class="calendar-nav">
        <button class="nav-btn" @click="prevMonth">&#8249;</button>
        <h2 class="calendar-month">{{ monthLabel }}</h2>
        <button class="nav-btn" @click="nextMonth">&#8250;</button>
        <div class="view-toggle">
          <button class="view-btn active">Mois</button>
        </div>
      </div>

      <!-- Day headers -->
      <div class="calendar-grid">
        <div class="day-header" v-for="d in dayNames" :key="d">{{ d }}</div>

        <!-- Empty cells before first day -->
        <div class="day-cell empty" v-for="_ in firstDayOfMonth" :key="'e' + _"></div>

        <!-- Day cells -->
        <div
          v-for="day in daysInMonth"
          :key="day"
          class="day-cell"
          :class="{ today: isToday(day), 'has-events': getDayEvents(day).length > 0 }"
        >
          <span class="day-number" :class="{ today: isToday(day) }">{{ day }}</span>
          <div class="day-events">
            <div
              v-for="evt in getDayEvents(day)"
              :key="evt.id"
              class="event-pill"
              :class="getEventColor(evt)"
              :title="evt.titre"
            >
              {{ evt.emoji || '•' }} {{ evt.titre }}
            </div>
          </div>
        </div>
      </div>

      <!-- Timezone + subscribe -->
      <div class="calendar-footer">
        <span class="tz-label">🌍 Europe/Paris</span>
        <a href="https://www.helloasso.com/associations/eglise-cieux-ouverts" target="_blank" rel="noopener" class="btn-subscribe">
          Billetterie Événements
        </a>
      </div>
    </section>

    <!-- Firebase events list below calendar -->
    <section class="events-list-section" v-if="!loading && evenements.length > 0">
      <div class="events-list-inner">
        <h2 class="events-list-title">Prochains événements</h2>
        <div class="events-list">
          <article v-for="evt in evenements" :key="evt.id" class="event-card">
            <div class="event-date-badge">
              <span class="badge-day">{{ formatDay(evt.date) }}</span>
              <span class="badge-month">{{ formatMonth(evt.date) }}</span>
            </div>
            <div class="event-body">
              <h3 class="event-title">{{ evt.titre }}</h3>
              <div class="event-meta">
                <span v-if="evt.heure">🕙 {{ evt.heure }}</span>
                <span v-if="evt.lieu">📍 {{ evt.lieu }}</span>
              </div>
              <p v-if="evt.description" class="event-desc">{{ evt.description }}</p>
              <div class="event-links" v-if="evt.lien || evt.billetterie">
                <a v-if="evt.lien" :href="evt.lien" target="_blank" rel="noopener" class="btn-event">En savoir plus</a>
                <a v-if="evt.billetterie" :href="evt.billetterie" target="_blank" rel="noopener" class="btn-event btn-event-outline">🎟️ Billetterie</a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <div v-if="loading" class="loading-msg">Chargement des événements...</div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: "Agenda — Église Cieux Ouverts Morlaix",
  description: "Tous les événements à venir à l'Église Cieux Ouverts de Morlaix.",
})

const { evenements, loading } = useEvenements()
const currentDate = ref(new Date())

// Calendar computed
const dayNames = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.']

const monthLabel = computed(() => {
  return currentDate.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
})

const daysInMonth = computed(() => {
  const d = currentDate.value
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  const d = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
  // Monday-based: 0=Mon, 6=Sun
  return (d.getDay() + 6) % 7
})

function isToday(day) {
  const now = new Date()
  return (
    now.getDate() === day &&
    now.getMonth() === currentDate.value.getMonth() &&
    now.getFullYear() === currentDate.value.getFullYear()
  )
}

function getDayEvents(day) {
  return evenements.value.filter(evt => {
    const d = toDate(evt.date)
    return (
      d.getDate() === day &&
      d.getMonth() === currentDate.value.getMonth() &&
      d.getFullYear() === currentDate.value.getFullYear()
    )
  })
}

const eventColors = ['color-blue', 'color-red', 'color-orange', 'color-purple', 'color-green']
function getEventColor(evt) {
  // Deterministic color based on title
  const idx = (evt.titre || '').charCodeAt(0) % eventColors.length
  return eventColors[idx]
}

function prevMonth() {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() - 1)
  currentDate.value = d
}

function nextMonth() {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() + 1)
  currentDate.value = d
}

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

</script>

<style scoped>
.page-agenda {
  background: white;
  min-height: 100vh;
}

/* Header */
.agenda-header {
  background: white;
  padding: 50px 48px 20px;
  border-bottom: 1px solid #eee;
}

.agenda-title {
  font-size: 1.4em;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px;
}

.agenda-subtitle {
  font-size: 0.9em;
  color: #888;
  margin: 0;
}

/* Calendar */
.agenda-calendar {
  padding: 0 24px 40px;
  max-width: 1100px;
  margin: 0 auto;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 0 16px;
  border-bottom: 1px solid #eee;
}

.nav-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  font-size: 1.2em;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.nav-btn:hover { background: #f5f5f5; }

.calendar-month {
  font-size: 1.1em;
  font-weight: 700;
  color: #064886;
  margin: 0;
  text-transform: capitalize;
}

.view-toggle {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.view-btn {
  background: none;
  border: none;
  font-size: 0.88em;
  color: #888;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}
.view-btn.active {
  color: #EF4B54;
  border-bottom: 2px solid #EF4B54;
  border-radius: 0;
  font-weight: 600;
}

/* Grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-left: 1px solid #eee;
  border-top: 1px solid #eee;
}

.day-header {
  text-align: center;
  padding: 10px 4px;
  font-size: 0.82em;
  color: #888;
  font-weight: 600;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  background: #fafafa;
}

.day-cell {
  min-height: 80px;
  padding: 6px 6px 4px;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  vertical-align: top;
  font-size: 0.82em;
  position: relative;
}

.day-cell.empty {
  background: #fafafa;
}

.day-number {
  display: inline-block;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  font-size: 0.85em;
  font-weight: 500;
  color: #444;
  border-radius: 50%;
  margin-bottom: 4px;
}

.day-number.today {
  background: #064886;
  color: white;
  font-weight: 700;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-pill {
  font-size: 0.75em;
  padding: 1px 5px;
  border-radius: 3px;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
}

.color-blue { background: #064886; }
.color-red { background: #EF4B54; }
.color-orange { background: #F59E0B; }
.color-purple { background: #7C3AED; }
.color-green { background: #10B981; }

/* Calendar footer */
.calendar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-top: 1px solid #eee;
  margin-top: 0;
}

.tz-label {
  font-size: 0.82em;
  color: #888;
}

.btn-subscribe {
  display: inline-block;
  padding: 10px 24px;
  background: #EF4B54;
  color: white;
  font-size: 0.9em;
  font-weight: 700;
  border-radius: 6px;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-subscribe:hover { background: #d63a43; }

/* Events list */
.events-list-section {
  background: #f7f9fc;
  padding: 40px 24px;
}

.events-list-inner {
  max-width: 800px;
  margin: 0 auto;
}

.events-list-title {
  font-size: 1.4em;
  font-weight: 700;
  color: #064886;
  margin: 0 0 24px;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.event-card {
  display: flex;
  gap: 20px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  align-items: flex-start;
}

.event-date-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  background: #064886;
  border-radius: 10px;
  padding: 10px 6px;
  color: white;
  flex-shrink: 0;
}

.badge-day { font-size: 1.6em; font-weight: 900; line-height: 1; }
.badge-month { font-size: 0.65em; font-weight: 700; letter-spacing: 0.06em; opacity: 0.85; text-transform: uppercase; }

.event-body { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.event-title { font-size: 1.05em; font-weight: 700; color: #064886; margin: 0; }
.event-meta { display: flex; gap: 14px; font-size: 0.85em; color: #888; flex-wrap: wrap; }
.event-desc { font-size: 0.88em; color: #666; line-height: 1.6; margin: 0; }

.event-links { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }

.btn-event {
  display: inline-block;
  padding: 8px 18px;
  background: #064886;
  color: white;
  font-size: 0.85em;
  font-weight: 600;
  border-radius: 6px;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-event:hover { background: #053870; }

.btn-event-outline {
  background: transparent;
  border: 2px solid #064886;
  color: #064886;
}
.btn-event-outline:hover { background: #064886; color: white; }

.loading-msg {
  text-align: center;
  padding: 40px;
  color: #888;
  font-size: 1em;
}

@media (max-width: 700px) {
  .agenda-header { padding: 30px 16px 16px; }
  .agenda-calendar { padding: 0 8px 30px; }
  .day-cell { min-height: 50px; padding: 3px; }
  .event-pill { display: none; }
  .event-card { flex-direction: column; gap: 12px; }
}
</style>
