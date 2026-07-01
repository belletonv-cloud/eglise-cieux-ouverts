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
                  <span v-if="evt.repeat_period" class="event-badge">{{ formatRepeatPeriod(evt.repeat_period) }}</span>
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
            <div class="event-recurrence">
              <label>Répétition
                <select v-model="repeatType">
                  <option value="">Aucune</option>
                  <option value="week">Chaque semaine</option>
                  <option value="biweek">Toutes les 2 semaines</option>
                  <option value="month">Chaque mois (même date)</option>
                  <option value="monthly_weekday">Même jour de la semaine du mois…</option>
                </select>
              </label>
              <div v-if="repeatType === 'monthly_weekday'" class="monthly-weekday-row">
                <span>Chaque</span>
                <select v-model="repeatOrdinal">
                  <option :value="1">1er</option>
                  <option :value="2">2e</option>
                  <option :value="3">3e</option>
                  <option :value="4">4e</option>
                  <option :value="-1">Dernier</option>
                </select>
                <select v-model="repeatWeekday">
                  <option :value="1">Lundi</option>
                  <option :value="2">Mardi</option>
                  <option :value="3">Mercredi</option>
                  <option :value="4">Jeudi</option>
                  <option :value="5">Vendredi</option>
                  <option :value="6">Samedi</option>
                  <option :value="0">Dimanche</option>
                </select>
                <span>du mois</span>
              </div>
            </div>
            <label>Emoji <input v-model="form.emoji" type="text" maxlength="5" /></label>
            <div class="event-image-section">
              <label class="event-image-label">Image</label>
              <div class="event-image-controls">
                <input v-model="form.image_url" type="url" placeholder="https://..." />
                <input ref="eventFileInput" type="file" accept="image/*" class="file-input-hidden" @change="onFileSelected" />
                <button class="event-btn-sec" type="button" @click="eventFileInput?.click()">Téléverser</button>
                <button v-if="uploadedImages.length" class="event-btn-sec" type="button" @click="toggleUploadedList">Uploadées ({{ uploadedImages.length }})</button>
              </div>
              <img v-if="form.image_url" :src="form.image_url" class="event-image-preview" alt="" />
              <div v-if="showUploadedList" class="event-uploaded-list">
                <div v-if="imagesLoading" class="event-status">Chargement...</div>
                <div v-else class="event-uploaded-grid">
                  <div v-for="(url, i) in uploadedImages" :key="i" class="event-uploaded-item" :class="{ selected: url === form.image_url }" @click="form.image_url = url">
                    <img :src="url" alt="" />
                  </div>
                </div>
              </div>
            </div>
            <label>Lien <input v-model="form.link" type="url" placeholder="https://..." /></label>
            <label>Billetterie <input v-model="form.ticket_url" type="url" placeholder="https://..." /></label>
            <label>Statut
              <select v-model="form.status">
                <option value="active">Actif</option>
                <option value="cancelled">Annulé</option>
              </select>
            </label>

            <div v-if="form.repeat_period" class="event-section">
              <h4>Prochaines dates</h4>
              <div class="next-dates-list">
                <div v-for="(d, i) in nextOccurrences" :key="i" class="next-date-item">
                  <span class="next-date-num">{{ i + 1 }}.</span>
                  <span>{{ formatDateShort(d) }}</span>
                  <span class="next-date-day">{{ d.toLocaleDateString('fr-FR', { weekday: 'long' }) }}</span>
                </div>
              </div>
            </div>

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
import { ref, computed, watch } from 'vue'

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
const originalExceptions = ref([])

// Image upload
const eventFileInput = ref(null)
const uploadedImages = ref([])
const showUploadedList = ref(false)
const imagesLoading = ref(false)
const uploadSaving = ref(false)

// ── Recurrence helpers ──────────────────────────────────────────────
function parseRepeatPeriod(rp) {
  if (!rp) return null
  if (rp === 'week') return { type: 'week', interval: 1 }
  if (rp === 'biweek') return { type: 'week', interval: 2 }
  if (rp === 'month') return { type: 'month' }
  if (rp.startsWith('monthly_weekday:')) {
    const parts = rp.split(':')
    return { type: 'monthly_weekday', ordinal: parseInt(parts[1]) || 1, weekday: parseInt(parts[2]) ?? 1 }
  }
  return null
}

function getNthWeekdayOfMonth(year, month, weekday, ordinal) {
  if (ordinal === -1) {
    const last = new Date(year, month + 1, 0)
    const diff = (last.getDay() - weekday + 7) % 7
    return new Date(year, month, last.getDate() - diff)
  }
  const first = new Date(year, month, 1)
  const diff = (weekday - first.getDay() + 7) % 7
  const date = 1 + diff + (ordinal - 1) * 7
  if (date > new Date(year, month + 1, 0).getDate()) return null
  return new Date(year, month, date)
}

const ORDINAL_FR = { 1: '1er', 2: '2e', 3: '3e', 4: '4e', '-1': 'dernier' }
const DAY_FR_SHORT = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']

function formatRepeatPeriod(rp) {
  if (!rp) return ''
  if (rp === 'week') return 'chaque semaine'
  if (rp === 'biweek') return 'toutes les 2 sem.'
  if (rp === 'month') return 'chaque mois'
  if (rp.startsWith('monthly_weekday:')) {
    const parts = rp.split(':')
    const n = parseInt(parts[1])
    const d = parseInt(parts[2])
    return `chaque ${ORDINAL_FR[n] || n + 'e'} ${DAY_FR_SHORT[d] || ''} du mois`
  }
  return rp
}

// Writable computed for the repeat type selector
const repeatType = computed({
  get() {
    const rp = form.value.repeat_period
    if (!rp) return ''
    if (rp === 'week' || rp === 'biweek' || rp === 'month') return rp
    if (rp.startsWith('monthly_weekday:')) return 'monthly_weekday'
    return ''
  },
  set(val) {
    if (!val) { form.value.repeat_period = ''; return }
    if (val === 'week' || val === 'biweek' || val === 'month') { form.value.repeat_period = val; return }
    if (val === 'monthly_weekday') {
      if (form.value.start_date) {
        const d = new Date(form.value.start_date + 'T00:00:00')
        const weekday = d.getDay()
        const ordinal = Math.min(Math.ceil(d.getDate() / 7), 4)
        form.value.repeat_period = `monthly_weekday:${ordinal}:${weekday}`
      } else {
        form.value.repeat_period = 'monthly_weekday:1:1'
      }
    }
  }
})

const repeatOrdinal = computed({
  get() {
    const rp = form.value.repeat_period
    if (!rp?.startsWith('monthly_weekday:')) return 1
    return parseInt(rp.split(':')[1]) || 1
  },
  set(val) {
    const rp = form.value.repeat_period
    if (!rp?.startsWith('monthly_weekday:')) return
    const parts = rp.split(':')
    form.value.repeat_period = `monthly_weekday:${val}:${parts[2]}`
  }
})

const repeatWeekday = computed({
  get() {
    const rp = form.value.repeat_period
    if (!rp?.startsWith('monthly_weekday:')) return 1
    return parseInt(rp.split(':')[2]) ?? 1
  },
  set(val) {
    const rp = form.value.repeat_period
    if (!rp?.startsWith('monthly_weekday:')) return
    const parts = rp.split(':')
    form.value.repeat_period = `monthly_weekday:${parts[1]}:${val}`
  }
})

const nextOccurrences = computed(() => {
  if (!form.value.repeat_period || !form.value.start_date) return []
  const rule = parseRepeatPeriod(form.value.repeat_period)
  if (!rule) return []
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const start = new Date(form.value.start_date + 'T00:00:00')
  const exceptions = form.value.exceptions || []
  const isCancelled = (d) => exceptions.some(ex => ex.exception_date === d.toISOString().slice(0, 10) && ex.type === 'cancelled')
  const results = []
  let safety = 0

  if (rule.type === 'week') {
    let d = new Date(start)
    while (d < now) d.setDate(d.getDate() + 7 * rule.interval)
    while (results.length < 6 && safety++ < 200) {
      if (!isCancelled(d)) results.push(new Date(d))
      d.setDate(d.getDate() + 7 * rule.interval)
    }
  } else if (rule.type === 'month') {
    let d = new Date(start)
    while (d < now) d.setMonth(d.getMonth() + 1)
    while (results.length < 6 && safety++ < 200) {
      if (!isCancelled(d)) results.push(new Date(d))
      d.setMonth(d.getMonth() + 1)
    }
  } else if (rule.type === 'monthly_weekday') {
    let year = start.getFullYear(), month = start.getMonth()
    while (results.length < 6 && safety++ < 200) {
      const occ = getNthWeekdayOfMonth(year, month, rule.weekday, rule.ordinal)
      if (occ && occ >= now && !isCancelled(occ)) results.push(occ)
      if (++month > 11) { month = 0; year++ }
    }
  }
  return results
})

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
    start_date: d.toISOString().slice(0, 10), end_date: evt.end_date || '',
    start_time: evt.heure || '', end_time: evt.fin || '', location: evt.lieu || '',
    repeat_period: evt.repeat_period || '', emoji: evt.emoji || '',
    image_url: evt.image_url || '', link: evt.lien || '',
    ticket_url: evt.billetterie || '', status: evt.statut || 'active',
    exceptions: evt.exceptions ? evt.exceptions.map(ex => ({ ...ex })) : []
  }
  // Snapshot pour calculer les exceptions ajoutées/supprimées au save.
  originalExceptions.value = (evt.exceptions || []).map(ex => ({ ...ex }))
}
function startCreate() {
  creating.value = true; editing.value = null; deleting.value = null; resetForm()
  originalExceptions.value = []
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
      heure: e.start_time || null, fin: e.end_time || null,
      end_date: e.end_date || null, lieu: e.location || null,
      description: e.description || null, image_url: e.image_url || null,
      repeat_period: e.repeat_period || null, emoji: e.emoji || null,
      lien: e.link || null, billetterie: e.ticket_url || null,
      statut: e.status || 'active',
      exceptions: e.exceptions || []
    })).sort((a, b) => a.date - b.date)
  } catch (e) { console.error(e); events.value = []
  } finally { loading.value = false }
}

// Synchronise les exceptions du formulaire avec le backend :
// supprime celles retirées (avaient un id, plus présentes) et crée les nouvelles
// (sans id). Les exceptions ne sont liées qu'aux événements récurrents.
async function syncExceptions(eventId) {
  if (!eventId) return
  const current = form.value.exceptions || []
  const original = originalExceptions.value || []
  for (const o of original) {
    if (o.id && !current.some(c => c.id === o.id)) {
      await api(`/api/church-events/${eventId}/exceptions/${o.id}`, { method: 'DELETE' })
    }
  }
  for (const c of current) {
    if (!c.id) {
      await api(`/api/church-events/${eventId}/exceptions`, { method: 'POST', body: JSON.stringify({
        type: c.type, exception_date: c.exception_date || null, new_date: c.new_date || null,
      }) })
    }
  }
}

function eventPayload() {
  return {
    title: form.value.title, description: form.value.description || null,
    start_date: form.value.start_date, end_date: form.value.end_date || null,
    start_time: form.value.start_time || null, end_time: form.value.end_time || null,
    location: form.value.location || null, repeat_period: form.value.repeat_period || null,
    emoji: form.value.emoji || null, image_url: form.value.image_url || null,
    link: form.value.link || null, ticket_url: form.value.ticket_url || null,
    status: form.value.status || 'active'
  }
}

async function createEvent() {
  if (!form.value.title || !form.value.start_date) { formError.value = 'Titre et date requis'; return }
  saving.value = true; formError.value = ''
  try {
    const res = await api('/api/church-events', { method: 'POST', body: JSON.stringify(eventPayload()) })
    const created = await res.json().catch(() => null)
    if (created?.id) await syncExceptions(created.id)
    await fetchEvents(); creating.value = false
  } catch (e) { formError.value = e.message
  } finally { saving.value = false }
}

async function updateEvent() {
  saving.value = true; formError.value = ''
  try {
    await api(`/api/church-events/${editing.value}`, { method: 'PUT', body: JSON.stringify(eventPayload()) })
    await syncExceptions(editing.value)
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
function formatDateShort(d) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

// Image upload
async function onFileSelected(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  uploadSaving.value = true
  try {
    const { getStorage, ref: storageRef, uploadBytes, getDownloadURL } = await import('firebase/storage')
    const storage = getStorage()
    const path = `uploads/${Date.now()}_${file.name}`
    const r = storageRef(storage, path)
    await uploadBytes(r, file)
    form.value.image_url = await getDownloadURL(r)
    await loadUploadedImages()
  } catch (err) {
    console.error('Upload error', err)
    formError.value = 'Erreur de téléversement'
  } finally {
    uploadSaving.value = false
    if (e.target) e.target.value = ''
  }
}

async function loadUploadedImages() {
  imagesLoading.value = true
  try {
    const { getStorage, ref: storageRef, listAll, getDownloadURL } = await import('firebase/storage')
    const storage = getStorage()
    const listRef = storageRef(storage, 'uploads')
    const res = await listAll(listRef)
    uploadedImages.value = await Promise.all(res.items.map(i => getDownloadURL(i)))
  } catch (err) {
    console.error('Load images error', err)
    uploadedImages.value = []
  } finally {
    imagesLoading.value = false
  }
}

function toggleUploadedList() {
  showUploadedList.value = !showUploadedList.value
  if (showUploadedList.value) loadUploadedImages()
}

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
.event-recurrence { display: flex; flex-direction: column; gap: 6px; }
.monthly-weekday-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 0.85em; font-weight: 600; color: #374151; }
.monthly-weekday-row select { padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9em; background: white; }
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

.event-image-section { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.event-image-label { font-size: 0.85em; font-weight: 600; color: #374151; }
.event-image-controls { display: flex; gap: 6px; flex-wrap: wrap; }
.event-image-controls input[type="url"] { flex: 1; min-width: 120px; }
.event-image-controls input[type="url"] { padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9em; }
.event-image-preview { max-width: 100%; max-height: 120px; object-fit: cover; border-radius: 6px; }
.file-input-hidden { display: none; }
.event-uploaded-list { max-height: 180px; overflow-y: auto; }
.event-uploaded-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.event-uploaded-item { border: 2px solid transparent; border-radius: 6px; overflow: hidden; cursor: pointer; }
.event-uploaded-item:hover { border-color: #93c5fd; }
.event-uploaded-item.selected { border-color: #2563eb; }
.event-uploaded-item img { width: 100%; height: 60px; object-fit: cover; display: block; }

.next-dates-list { display: flex; flex-direction: column; gap: 4px; }
.next-date-item { display: flex; align-items: center; gap: 8px; font-size: 0.85em; color: #374151; padding: 4px 8px; background: #f9fafb; border-radius: 4px; }
.next-date-num { font-weight: 700; color: #2563eb; min-width: 16px; }
.next-date-day { color: #6b7280; font-size: 0.9em; }
</style>
