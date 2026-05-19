<template>
  <div class="admin-manage-page">
    <div class="admin-manage-card">
      <h1>Administration</h1>
      <p class="admin-manage-subtitle">Église Cieux Ouverts — Morlaix</p>

      <nav class="admin-tabs">
        <button :class="{ active: tab === 'guide' }" @click="tab = 'guide'">📖 Guide</button>
        <button :class="{ active: tab === 'events' }" @click="tab = 'events'">📅 Événements</button>
        <button :class="{ active: tab === 'admins' }" @click="tab = 'admins'">👥 Admins</button>
      </nav>

      <!-- GUIDE -->
      <section v-if="tab === 'guide'" class="tab-content">
        <div class="admin-info-steps">
          <div class="admin-step">
            <span class="step-number">1</span>
            <div class="step-content">
              <h3>Activer le mode édition</h3>
              <p>Ajoutez <code>?admin=true</code> à la fin de l'URL :</p>
              <div class="url-examples">
                <code class="url-code">/?admin=true</code>
                <code class="url-code">/contact?admin=true</code>
              </div>
            </div>
          </div>
          <div class="admin-step">
            <span class="step-number">2</span>
            <div class="step-content">
              <h3>Modifier un bloc</h3>
              <p>Cliquez sur un bloc. Le panneau d'édition apparaît à droite.</p>
            </div>
          </div>
          <div class="admin-step">
            <span class="step-number">3</span>
            <div class="step-content">
              <h3>Sauvegarder</h3>
              <p>Cliquez sur <strong>"Sauvegarder"</strong> après connexion Google.</p>
            </div>
          </div>
        </div>
        <div class="admin-info-actions">
          <NuxtLink to="/?admin=true" class="btn-admin btn-primary">Ouvrir l'éditeur →</NuxtLink>
        </div>
      </section>

      <!-- ÉVÉNEMENTS -->
      <section v-if="tab === 'events'" class="tab-content">
        <h2>Événements billetterie</h2>
        <p class="section-desc">Ajoutez des événements pour la billetterie.</p>

        <div class="event-form">
          <div class="form-row">
            <input type="text" v-model="newEvent.title" placeholder="Titre de l'événement" class="input-text" />
          </div>
          <div class="form-row">
            <input type="date" v-model="newEvent.date" class="input-date" />
            <input type="text" v-model="newEvent.time" placeholder="Heure (ex: 10h00)" class="input-text" />
          </div>
          <div class="form-row">
            <input type="text" v-model="newEvent.location" placeholder="Lieu" class="input-text" />
            <input type="text" v-model="newEvent.emoji" placeholder="Emoji (ex: 🎉)" class="input-text" style="max-width:80px" />
          </div>
          <div class="form-row">
            <textarea v-model="newEvent.description" placeholder="Description" class="input-textarea" rows="2"></textarea>
          </div>
          <div class="form-row">
            <input type="text" v-model="newEvent.billetterie_url" placeholder="URL billetterie (HelloAsso...)" class="input-text" />
          </div>
          <button class="btn-add" @click="addEvent" :disabled="!newEvent.title || !newEvent.date || eventsLoading">
            {{ eventsLoading ? '⏳...' : '+ Ajouter' }}
          </button>
          <span class="saved-msg" v-if="eventSaved">✓ Événement ajouté</span>
        </div>

        <div class="events-list">
          <div class="event-item" v-for="ev in customEvents" :key="ev.id">
            <span class="event-emoji">{{ ev.emoji || '📅' }}</span>
            <div class="event-info">
              <strong>{{ ev.titre }}</strong>
              <span class="event-date">{{ formatDate(ev.date) }}{{ ev.heure ? ' à ' + ev.heure : '' }}</span>
              <span v-if="ev.lieu" class="event-lieu">📍 {{ ev.lieu }}</span>
            </div>
            <button class="btn-delete" @click="deleteEvent(ev.id)" :disabled="eventsLoading">✕</button>
          </div>
          <p class="empty" v-if="customEvents.length === 0">Aucun événement custom.</p>
        </div>
      </section>

      <!-- ADMINS -->
      <section v-if="tab === 'admins'" class="tab-content">
        <h2>Administrateurs autorisés</h2>
        <p class="section-desc">Emails Google autorisés à accéder à l'interface d'administration.</p>

        <div class="form-row">
          <input type="email" v-model="newAdminEmail" placeholder="adresse@gmail.com" class="input-text" />
          <button class="btn-add" @click="addAdmin" :disabled="!newAdminEmail || adminsLoading">
            {{ adminsLoading ? '⏳...' : 'Ajouter' }}
          </button>
        </div>
        <span class="saved-msg" v-if="adminSaved">✓ Admin ajouté</span>

        <div class="admin-list">
          <div class="admin-item" v-for="a in adminEmails" :key="a">
            <span class="admin-email">{{ a }}</span>
            <button class="btn-delete" @click="removeAdmin(a)" :disabled="adminsLoading">✕</button>
          </div>
          <p class="empty" v-if="adminEmails.length === 0">Aucun admin configuré.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Administration — Église Cieux Ouverts',
  description: 'Gestion des événements, admins et édition du site.',
})

const tab = ref('guide')

// Events
const customEvents = ref([])
const eventsLoading = ref(false)
const eventSaved = ref(false)
const newEvent = ref({ title: '', date: '', time: '', location: '', description: '', billetterie_url: '', emoji: '' })

async function loadEvents() {
  try {
    const res = await fetch('/api/events')
    if (res.ok) {
      const data = await res.json()
      customEvents.value = data.events || []
    }
  } catch (e) {
    console.error('Load events error:', e)
  }
}

async function addEvent() {
  if (!newEvent.value.title || !newEvent.value.date) return
  eventsLoading.value = true
  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...newEvent.value }),
    })
    if (res.ok) {
      eventSaved.value = true
      setTimeout(() => eventSaved.value = false, 2000)
      newEvent.value = { title: '', date: '', time: '', location: '', description: '', billetterie_url: '', emoji: '' }
      await loadEvents()
    }
  } catch (e) {
    console.error('Add event error:', e)
  } finally {
    eventsLoading.value = false
  }
}

async function deleteEvent(id) {
  if (!confirm('Supprimer cet événement ?')) return
  eventsLoading.value = true
  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    })
    if (res.ok) await loadEvents()
  } catch (e) {
    console.error('Delete event error:', e)
  } finally {
    eventsLoading.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
}

// Admins
const adminEmails = ref([])
const adminsLoading = ref(false)
const adminSaved = ref(false)
const newAdminEmail = ref('')

async function loadAdmins() {
  try {
    const res = await fetch('/api/admins')
    if (res.ok) {
      const data = await res.json()
      adminEmails.value = data.admins || []
    }
  } catch (e) {
    console.error('Load admins error:', e)
  }
}

async function addAdmin() {
  if (!newAdminEmail.value) return
  adminsLoading.value = true
  try {
    const res = await fetch('/api/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', email: newAdminEmail.value }),
    })
    if (res.ok) {
      adminSaved.value = true
      setTimeout(() => adminSaved.value = false, 2000)
      newAdminEmail.value = ''
      await loadAdmins()
    }
  } catch (e) {
    console.error('Add admin error:', e)
  } finally {
    adminsLoading.value = false
  }
}

async function removeAdmin(email) {
  if (!confirm(`Retirer ${email} des admins ?`)) return
  adminsLoading.value = true
  try {
    const res = await fetch('/api/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', email }),
    })
    if (res.ok) await loadAdmins()
  } catch (e) {
    console.error('Remove admin error:', e)
  } finally {
    adminsLoading.value = false
  }
}

onMounted(() => {
  loadEvents()
  loadAdmins()
})
</script>

<style scoped>
.admin-manage-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: linear-gradient(135deg, #064886 0%, #d97777 100%);
  padding: 40px 20px;
}
.admin-manage-card {
  max-width: 700px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.15);
  color: #1a1a2e;
}
.admin-manage-card h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(24px, 5vw, 32px);
  color: #064886;
  margin: 0 0 4px;
  text-align: center;
}
.admin-manage-subtitle {
  text-align: center;
  color: #888;
  font-size: 0.9em;
  margin: 0 0 24px;
}
.admin-tabs {
  display: flex;
  gap: 4px;
  background: #f0f0f5;
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 24px;
}
.admin-tabs button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #666;
  font-size: 0.88em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.admin-tabs button.active {
  background: white;
  color: #064886;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.tab-content h2 {
  font-size: 1.1em;
  color: #1a1a2e;
  margin: 0 0 4px;
}
.section-desc {
  font-size: 0.85em;
  color: #888;
  margin: 0 0 20px;
}

/* Guide */
.admin-info-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}
.admin-step {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.step-number {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #064886;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85em;
}
.step-content h3 {
  margin: 0 0 4px;
  font-size: 0.95em;
  color: #1a1a2e;
}
.step-content p {
  margin: 0;
  font-size: 0.85em;
  color: #555;
  line-height: 1.5;
}
.step-content code {
  background: #f0f0f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  color: #064886;
}
.url-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.url-code {
  background: #f0f0f5;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.82em;
  color: #064886;
  font-family: monospace;
}
.admin-info-actions {
  text-align: center;
}
.btn-admin {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 50px;
  font-size: 0.95em;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  border: none;
  cursor: pointer;
}
.btn-admin:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}
.btn-primary {
  background: #064886;
  color: white;
}

/* Forms */
.form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.input-text, .input-date, .input-textarea {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.88em;
  font-family: inherit;
  outline: none;
}
.input-text:focus, .input-date:focus, .input-textarea:focus {
  border-color: #064886;
  box-shadow: 0 0 0 2px rgba(6,72,134,0.1);
}
.input-textarea {
  resize: vertical;
  min-height: 50px;
}
.btn-add {
  padding: 10px 20px;
  background: #064886;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.88em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-add:hover { background: #053870; }
.btn-add:disabled { opacity: 0.5; cursor: not-allowed; }
.saved-msg {
  font-size: 0.82em;
  color: #10B981;
  font-weight: 600;
  margin-left: 10px;
}

/* Lists */
.events-list, .admin-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.event-item, .admin-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: background 0.2s;
}
.event-item:hover, .admin-item:hover {
  background: #f0f4ff;
}
.event-emoji {
  font-size: 1.3em;
  flex-shrink: 0;
}
.event-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.event-info strong {
  font-size: 0.92em;
  color: #1a1a2e;
}
.event-date {
  font-size: 0.8em;
  color: #888;
}
.event-lieu {
  font-size: 0.8em;
  color: #666;
}
.admin-email {
  flex: 1;
  font-size: 0.9em;
  color: #1a1a2e;
  font-family: monospace;
}
.btn-delete {
  background: none;
  border: none;
  color: #EF4B54;
  font-size: 1em;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}
.btn-delete:hover { background: rgba(239,75,84,0.1); }
.btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }
.empty {
  text-align: center;
  color: #aaa;
  font-size: 0.88em;
  padding: 20px;
}
</style>
