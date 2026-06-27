<template>
  <Teleport to="body">
    <div v-if="open" class="event-manager-overlay" @click.self="close">
      <div class="event-manager">
        <div class="event-manager-header">
          <h2>Gestion des événements</h2>
          <button class="event-manager-close" @click="close">&times;</button>
        </div>

        <div v-if="!editing && !creating && !deleting" class="event-manager-body">
          <button class="event-add-btn" @click="startCreate">+ Nouvel événement</button>
          <div v-if="loading" class="event-status">Chargement...</div>
          <div v-else class="event-list">
            <div v-for="evt in events" :key="evt.id" class="event-row" @click="startEdit(evt)">
              <div class="event-row-date">
                <span class="event-row-day">{{ formatDay(evt.date) }}</span>
                <span class="event-row-month">{{ formatMonth(evt.date) }}</span>
              </div>
              <div class="event-row-info">
                <strong>{{ evt.emoji }} {{ evt.titre }}</strong>
                <div class="event-row-meta">
                  <span v-if="evt.heure">{{ evt.heure }}</span>
                  <span v-if="evt.lieu">{{ evt.lieu }}</span>
                  <span v-if="evt.repeat_period" class="event-badge">chaque {{ evt.repeat_period === 'week' ? 'semaine' : 'mois' }}</span>
                </div>
              </div>
              <button class="event-delete-btn" @click.stop="deleting = evt" title="Supprimer">&times;</button>
            </div>
            <p v-if="events.length === 0" class="event-status">Aucun événement.</p>
          </div>
        </div>

        <div v-if="creating || editing" class="event-manager-body">
          <h3 class="event-form-title">{{ creating ? 'Nouvel événement' : 'Modifier l\'événement' }}</h3>
          <div class="event-form">
            <label>Titre * <input v-model="form.title" type="text" /></label>
            <label>Description <textarea v-model="form.description" rows="3"></textarea></label>
            <div class="event-form-row">
              <label>Date début * <input v-model="form.start_date" type="date" /></label>
              <label>Date fin <input v-model="form.end_date" type="date" /></label>
            </div>
            <div class="event-form-row">
              <label>Heure <input v-model="form.start_time" type="time" /></label>
              <label>Fin <input v-model="form.end_time" type="time" /></label>
            </div>
            <label>Lieu <input v-model="form.location" type="text" /></label>
            <label>Répétition
              <select v-model="form.repeat_period">
                <option value="">Aucune</option>
                <option value="week">Chaque semaine</option>
                <option value="month">Chaque mois</option>
              </select>
            </label>
            <label>Emoji <input v-model="form.emoji" type="text" maxlength="5" /></label>
            <label>Image <input v-model="form.image_url" type="url" placeholder="https://..." /></label>
            <label>Lien <input v-model="form.link" type="url" placeholder="https://..." /></label>
            <label>Billetterie <input v-model="form.ticket_url" type="url" placeholder="https://..." /></label>
            <label>Statut
              <select v-model="form.status">
                <option value="active">Actif</option>
                <option value="cancelled">Annulé</option>
              </select>
            </label>

            <div v-if="editing" class="event-section">
              <h4>Exceptions</h4>
              <div v-for="(ex, i) in form.exceptions" :key="i" class="exception-row">
                <span>{{ ex.exception_date }} — {{ ex.type === 'cancelled' ? 'Annulé' : 'Déplacé au ' + (ex.new_date || '?') }}</span>
                <button @click="form.exceptions.splice(i, 1)" title="Supprimer">&times;</button>
              </div>
              <div class="exception-add">
                <select v-model="newEx.type">
                  <option value="cancelled">Annulé</option>
                  <option value="moved">Déplacé</option>
                </select>
                <input v-model="newEx.exception_date" type="date" />
                <input v-if="newEx.type === 'moved'" v-model="newEx.new_date" type="date" placeholder="Nouvelle date" />
                <button @click="addException">+</button>
              </div>
            </div>

            <p v-if="formError" class="event-error">{{ formError }}</p>
            <div class="event-form-actions">
              <button class="event-btn" @click="creating ? createEvent() : updateEvent()" :disabled="saving">
                {{ saving ? '...' : (creating ? 'Créer' : 'Enregistrer') }}
              </button>
              <button class="event-btn-sec" @click="cancelForm">Annuler</button>
            </div>
          </div>
        </div>

        <div v-if="deleting" class="event-manager-body">
          <p>Supprimer « <strong>{{ deleting.titre }}</strong> » ?</p>
          <div class="event-form-actions">
            <button class="event-btn" @click="deleteEvent" :disabled="saving">Confirmer</button>
            <button class="event-btn-sec" @click="deleting = null">Annuler</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ open: Boolean })
const emit = defineEmits(['close'])
const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl || 'https://eglise-app.belletonv.workers.dev'

const events = ref([])
const loading = ref(false)
const editing = ref(null)
const creating = ref(false)
const deleting = ref(null)
const saving = ref(false)
const formError = ref('')

const newEx = ref({ type: 'cancelled', exception_date: '', new_date: '' })

const form = ref({
  title: '', description: '', start_date: '', end_date: '',
  start_time: '', end_time: '', location: '', repeat_period: '',
  emoji: '', image_url: '', link: '', ticket_url: '', status: 'active',
  exceptions: []
})

function resetForm() {
  form.value = { title: '', description: '', start_date: '', end_date: '',
    start_time: '', end_time: '', location: '', repeat_period: '',
    emoji: '', image_url: '', link: '', ticket_url: '', status: 'active',
    exceptions: [] }
  formError.value = ''
}

function close() { editing.value = null; creating.value = false; deleting.value = null; emit('close') }
function cancelForm() { editing.value = null; creating.value = false; resetForm() }

function startEdit(evt) {
  editing.value = evt.id; creating.value = false; deleting.value = null
  const d = evt.date instanceof Date ? evt.date : new Date(evt.date + 'T00:00:00')
  form.value = {
    title: evt.titre || '', description: evt.description || '',
    start_date: d.toISOString().slice(0, 10), end_date: '',
    start_time: evt.heure || '', end_time: '', location: evt.lieu || '',
    repeat_period: evt.repeat_period || '', emoji: evt.emoji || '',
    image_url: evt.image_url || '', link: evt.lien || '',
    ticket_url: evt.billetterie || '', status: 'active',
    exceptions: evt.exceptions ? [...evt.exceptions] : []
  }
}
function startCreate() {
  creating.value = true; editing.value = null; deleting.value = null; resetForm()
}

function addException() {
  if (!newEx.value.exception_date) return
  form.value.exceptions.push({ ...newEx.value })
  newEx.value = { type: 'cancelled', exception_date: '', new_date: '' }
}

async function getToken() {
  const { $auth } = useNuxtApp()
  return new Promise(r => {
    const u = $auth.onAuthStateChanged(u => { if (u) u.getIdToken().then(r); else r(null); if (typeof u === 'function') u() })
  })
}

async function api(path, opts = {}) {
  const token = await getToken()
  const h = { 'Content-Type': 'application/json', ...opts.headers }
  if (token) h['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${apiUrl}${path}`, { ...opts, headers: h })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res
}

async function fetchEvents() {
  loading.value = true
  try {
    const res = await api('/api/church-events?include_exceptions=1', { method: 'GET' })
    const data = await res.json()
    events.value = (data || []).map(e => ({
      id: e.id, titre: e.title, date: new Date(e.start_date + 'T00:00:00'),
      heure: e.start_time || null, lieu: e.location || null,
      description: e.description || null, image_url: e.image_url || null,
      repeat_period: e.repeat_period || null, emoji: e.emoji || null,
      lien: e.link || null, billetterie: e.ticket_url || null,
      exceptions: e.exceptions || []
    })).sort((a, b) => a.date - b.date)
  } catch (e) { console.error(e); events.value = []
  } finally { loading.value = false }
}

async function createEvent() {
  if (!form.value.title || !form.value.start_date) { formError.value = 'Titre et date requis'; return }
  saving.value = true; formError.value = ''
  try {
    await api('/api/church-events', { method: 'POST', body: JSON.stringify({
      title: form.value.title, description: form.value.description || null,
      start_date: form.value.start_date, end_date: form.value.end_date || null,
      start_time: form.value.start_time || null, end_time: form.value.end_time || null,
      location: form.value.location || null, repeat_period: form.value.repeat_period || null,
      emoji: form.value.emoji || null, image_url: form.value.image_url || null,
      link: form.value.link || null, ticket_url: form.value.ticket_url || null,
      status: form.value.status || 'active'
    }) })
    await fetchEvents(); creating.value = false
  } catch (e) { formError.value = e.message
  } finally { saving.value = false }
}

async function updateEvent() {
  saving.value = true; formError.value = ''
  try {
    await api(`/api/church-events/${editing.value}`, { method: 'PUT', body: JSON.stringify({
      title: form.value.title, description: form.value.description || null,
      start_date: form.value.start_date, end_date: form.value.end_date || null,
      start_time: form.value.start_time || null, end_time: form.value.end_time || null,
      location: form.value.location || null, repeat_period: form.value.repeat_period || null,
      emoji: form.value.emoji || null, image_url: form.value.image_url || null,
      link: form.value.link || null, ticket_url: form.value.ticket_url || null,
      status: form.value.status || 'active'
    }) })
    await fetchEvents(); editing.value = null
  } catch (e) { formError.value = e.message
  } finally { saving.value = false }
}

async function deleteEvent() {
  if (!deleting.value) return
  saving.value = true
  try {
    await api(`/api/church-events/${deleting.value.id}`, { method: 'DELETE' })
    await fetchEvents(); deleting.value = null
  } catch (e) { formError.value = e.message
  } finally { saving.value = false }
}

function formatDay(d) { return d.toLocaleDateString('fr-FR', { day: '2-digit' }) }
function formatMonth(d) { return d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase() }

watch(() => props.open, (v) => { if (v) fetchEvents() })
</script>

<style scoped>
.event-manager-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.event-manager {
  background: #fff; border-radius: 12px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.12);
  width: 100%; max-width: 640px;
  max-height: 85vh; display: flex; flex-direction: column;
}
.event-manager-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #e5e7eb;
}
.event-manager-header h2 { margin: 0; font-size: 1.1em; font-weight: 700; color: #111827; }
.event-manager-close {
  background: #f3f4f6; border: none; width: 32px; height: 32px;
  border-radius: 50%; font-size: 1.3em; cursor: pointer;
  display: flex; align-items: center; justify-content: center; color: #6b7280;
}
.event-manager-close:hover { background: #e5e7eb; color: #111827; }
.event-manager-body { padding: 20px 24px; overflow-y: auto; flex: 1; }
.event-add-btn {
  width: 100%; padding: 10px; font-size: 0.9em; font-weight: 600;
  background: #2563eb; color: #fff; border: none; border-radius: 8px;
  cursor: pointer; margin-bottom: 16px;
}
.event-add-btn:hover { background: #1d4ed8; }
.event-status { text-align: center; color: #6b7280; padding: 24px; }
.event-list { display: flex; flex-direction: column; gap: 8px; }
.event-row {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 14px; border: 1px solid #e5e7eb; border-radius: 8px;
  cursor: pointer; transition: all .15s;
}
.event-row:hover { border-color: #2563eb; background: #f8faff; }
.event-row-date {
  display: flex; flex-direction: column; align-items: center;
  min-width: 44px; flex-shrink: 0;
}
.event-row-day { font-size: 1.2em; font-weight: 800; color: #111827; line-height: 1.1; }
.event-row-month { font-size: 0.65em; font-weight: 700; color: #6b7280; text-transform: uppercase; }
.event-row-info { flex: 1; min-width: 0; }
.event-row-info strong { font-size: 0.9em; color: #111827; display: block; }
.event-row-meta { display: flex; gap: 8px; font-size: 0.78em; color: #6b7280; flex-wrap: wrap; margin-top: 2px; }
.event-badge { background: #eff6ff; color: #2563eb; padding: 1px 6px; border-radius: 4px; font-weight: 600; font-size: 0.75em; }
.event-delete-btn {
  background: none; border: none; font-size: 1.2em; color: #9ca3af;
  cursor: pointer; padding: 4px; flex-shrink: 0;
}
.event-delete-btn:hover { color: #ef4444; }
.event-form-title { font-size: 1em; font-weight: 700; color: #111827; margin: 0 0 16px; }
.event-form { display: flex; flex-direction: column; gap: 14px; }
.event-form label { display: flex; flex-direction: column; gap: 4px; font-size: 0.85em; font-weight: 600; color: #374151; }
.event-form input, .event-form select, .event-form textarea {
  padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px;
  font-size: 0.9em; font-family: inherit; background: #fff;
}
.event-form input:focus, .event-form select:focus, .event-form textarea:focus {
  outline: none; border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,0.15);
}
.event-form-row { display: flex; gap: 12px; }
.event-form-row label { flex: 1; }
.event-form-actions { display: flex; gap: 8px; margin-top: 4px; }
.event-btn {
  padding: 10px 20px; background: #2563eb; color: #fff;
  border: none; border-radius: 8px; font-size: 0.9em; font-weight: 600; cursor: pointer;
}
.event-btn:hover { background: #1d4ed8; }
.event-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.event-btn-sec {
  padding: 10px 20px; background: #f3f4f6; color: #374151;
  border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9em; font-weight: 600; cursor: pointer;
}
.event-btn-sec:hover { background: #e5e7eb; }
.event-error { color: #ef4444; font-size: 0.85em; margin: 0; }
.event-section { border-top: 1px solid #e5e7eb; padding-top: 14px; }
.event-section h4 { margin: 0 0 8px; font-size: 0.9em; color: #374151; }
.exception-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 0.82em; color: #6b7280; }
.exception-row button { background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 1.1em; }
.exception-row button:hover { color: #ef4444; }
.exception-add { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.exception-add select, .exception-add input { padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.82em; }
.exception-add button { padding: 6px 12px; background: #2563eb; color: #fff; border: none; border-radius: 6px; font-size: 0.82em; cursor: pointer; }
.exception-add button:hover { background: #1d4ed8; }
</style>
