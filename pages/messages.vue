<template>
  <div class="page-messages">
    <div class="page-hero">
      <h1>Messages</h1>
      <p>Retrouvez les prédications et enseignements de l'église</p>
    </div>

    <section class="section">
      <div v-if="loading" class="loading">Chargement des messages...</div>

      <div v-else-if="messages.length === 0" class="empty">
        <p>Aucun message pour l'instant. Revenez bientôt !</p>
      </div>

      <div v-else class="messages-grid">
        <article v-for="msg in messages" :key="msg.id" class="message-card card">
          <div class="message-meta">
            <span class="message-date">{{ formatDate(msg.date) }}</span>
            <span v-if="msg.serie" class="message-serie">{{ msg.serie }}</span>
          </div>
          <h2 class="message-title">{{ msg.titre }}</h2>
          <p v-if="msg.predicateur" class="message-preacher">{{ msg.predicateur }}</p>
          <p v-if="msg.description" class="message-desc">{{ msg.description }}</p>
          <div class="message-links">
            <a v-if="msg.youtube" :href="msg.youtube" target="_blank" rel="noopener" class="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-3px;margin-right:6px"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              Voir sur YouTube
            </a>
            <a v-if="msg.audio" :href="msg.audio" target="_blank" rel="noopener" class="btn btn-outline-purple">
              🎧 Écouter
            </a>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Messages — Église Cieux Ouverts Morlaix',
  description: 'Prédications et enseignements de l\'Église Cieux Ouverts à Morlaix.',
})

const { $db } = useNuxtApp()
const { collection, getDocs, orderBy, query } = await import('firebase/firestore')

const messages = ref([])
const loading = ref(true)

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(async () => {
  try {
    const q = query(collection($db, 'messages'), orderBy('date', 'desc'))
    const snap = await getDocs(q)
    messages.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
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

.messages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.message-card { display: flex; flex-direction: column; gap: 10px; }

.message-meta { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

.message-date { font-size: 0.82em; color: var(--text-light); font-weight: 500; }

.message-serie {
  font-size: 0.8em;
  background: rgba(124,58,237,0.1);
  color: var(--primary-purple);
  padding: 3px 10px;
  border-radius: 50px;
  font-weight: 600;
}

.message-title { font-size: 1.2em; font-weight: 700; color: var(--text-dark); }
.message-preacher { font-size: 0.9em; color: var(--primary-pink); font-weight: 600; }
.message-desc { font-size: 0.9em; color: var(--text-gray); line-height: 1.6; }

.message-links { margin-top: auto; display: flex; gap: 10px; flex-wrap: wrap; }

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
</style>
