<template>
  <Teleport to="body">
    <div v-if="open" class="taches-overlay" @click.self="$emit('close')">
      <div class="taches-modal">
        <header class="taches-header">
          <div>
            <h2>Tâches</h2>
            <p class="taches-sub">Qui fait quoi — une tâche prise ne peut plus être prise par quelqu'un d'autre.</p>
          </div>
          <button class="taches-close" @click="$emit('close')" title="Fermer">✕</button>
        </header>

        <div class="taches-filtres">
          <button
            v-for="f in FILTRES"
            :key="f.valeur"
            class="taches-filtre"
            :class="{ actif: filtre === f.valeur }"
            @click="filtre = f.valeur"
          >{{ f.libelle }} ({{ compteParSource(f.valeur) }})</button>

          <label class="taches-mines">
            <input type="checkbox" v-model="seulementLesMiennes" />
            Seulement les miennes
          </label>
        </div>

        <form class="taches-ajout" @submit.prevent="ajouter">
          <input v-model="nouveauTitre" placeholder="Nouvelle tâche…" maxlength="140" class="taches-input" />
          <select v-model="nouvelleSource" class="taches-select">
            <option value="service">Service</option>
            <option value="site">Site</option>
            <option value="projet">Projet</option>
          </select>
          <button type="submit" class="taches-btn" :disabled="!nouveauTitre.trim() || enregistre">
            {{ enregistre ? '…' : 'Ajouter' }}
          </button>
        </form>

        <p v-if="erreur" class="taches-erreur">{{ erreur }}</p>

        <div v-if="chargement" class="taches-vide">Chargement…</div>
        <p v-else-if="taches.length === 0" class="taches-vide">
          Aucune tâche pour l'instant — ajoute la première ci-dessus.
        </p>

        <!-- Les colonnes restent affichées même à vide : elles montrent la
             structure du tableau et servent de cible de dépôt. -->
        <div v-if="!chargement" class="taches-colonnes">
          <section v-for="col in COLONNES" :key="col.statut" class="taches-colonne">
            <h3>{{ col.libelle }} <span class="taches-compte">{{ parStatut(col.statut).length }}</span></h3>

            <VueDraggable
              v-model="listes[col.statut]"
              :group="{ name: 'taches' }"
              :animation="150"
              ghost-class="taches-carte-ghost"
              tag="div"
              class="taches-liste"
              @add="(e) => deplacer(e, col.statut)"
            >
              <article v-for="t in listes[col.statut]" :key="t.id" class="taches-carte" :class="{ prise: t.prisPar }">
                <span class="taches-source" :data-source="t.source">{{ libelleSource(t.source) }}</span>
                <p class="taches-titre">{{ t.titre }}</p>

                <p v-if="t.debut || t.fin" class="taches-dates">
                  {{ t.debut || '?' }} → {{ t.fin || '?' }}
                </p>

                <p v-if="t.prisPar" class="taches-titulaire">
                  <template v-if="estMoi(t.prisPar)">✋ Tu as pris cette tâche</template>
                  <template v-else>🔒 Prise par {{ t.prisPar }}</template>
                </p>
                <p v-else class="taches-libre">Libre</p>

                <div class="taches-actions">
                  <button v-if="!t.prisPar" class="taches-btn taches-btn-prendre" :disabled="occupe === t.id" @click="prendre(t)">
                    {{ occupe === t.id ? '…' : 'Je prends' }}
                  </button>
                  <button
                    v-else-if="estMoi(t.prisPar) || monRole === 'admin'"
                    class="taches-btn taches-btn-second"
                    :disabled="occupe === t.id"
                    @click="liberer(t)"
                  >Libérer</button>

                  <button
                    v-if="peutSupprimer"
                    class="taches-supprimer"
                    title="Supprimer cette tâche"
                    @click="supprimer(t)"
                  >🗑</button>
                </div>
              </article>
            </VueDraggable>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'

const { $auth } = useNuxtApp()

const props = defineProps({
  open: { type: Boolean, default: false },
  /** Email de l'utilisateur courant, pour distinguer « mes » tâches. */
  monEmail: { type: String, default: '' },
  /** 'admin' | 'editor' | 'planning' — pilote les actions autorisées. */
  monRole: { type: String, default: '' },
})
defineEmits(['close'])

const COLONNES = [
  { statut: 'a_faire', libelle: 'À faire' },
  { statut: 'en_cours', libelle: 'En cours' },
  { statut: 'fait', libelle: 'Fait' },
]
const FILTRES = [
  { valeur: 'tous', libelle: 'Tout' },
  { valeur: 'service', libelle: 'Service' },
  { valeur: 'site', libelle: 'Site' },
  { valeur: 'projet', libelle: 'Projet' },
]
const LIBELLES_SOURCE = { service: 'Service', site: 'Site', projet: 'Projet' }

const taches = ref([])
const chargement = ref(false)
const enregistre = ref(false)
const occupe = ref(null)
const erreur = ref('')
const filtre = ref('tous')
const seulementLesMiennes = ref(false)
const nouveauTitre = ref('')
const nouvelleSource = ref('projet')

// Les colonnes doivent être des tableaux modifiables : vue-draggable-plus
// réordonne le tableau lié, ce qu'une computed ne permet pas.
const listes = ref({ a_faire: [], en_cours: [], fait: [] })

const peutSupprimer = computed(() => props.monRole === 'admin' || props.monRole === 'editor')

function estMoi(email) {
  return !!email && email.toLowerCase() === (props.monEmail || '').toLowerCase()
}
function libelleSource(s) {
  return LIBELLES_SOURCE[s] || s
}

const tachesVisibles = computed(() =>
  taches.value.filter((t) => {
    if (filtre.value !== 'tous' && t.source !== filtre.value) return false
    if (seulementLesMiennes.value && !estMoi(t.prisPar)) return false
    return true
  })
)

function parStatut(statut) {
  return tachesVisibles.value.filter((t) => t.statut === statut)
}

function reconstruireColonnes() {
  listes.value = {
    a_faire: parStatut('a_faire'),
    en_cours: parStatut('en_cours'),
    fait: parStatut('fait'),
  }
}

function compteParSource(valeur) {
  return valeur === 'tous' ? taches.value.length : taches.value.filter((t) => t.source === valeur).length
}

watch([tachesVisibles], reconstruireColonnes, { immediate: true })
watch(() => props.open, (ouvert) => { if (ouvert) charger() })

// Le jeton vient de l'utilisateur Firebase courant. `getFirebaseToken` n'est
// pas un auto-import : c'est une fonction locale d'AdminToolbar, invisible
// ici — d'où une résolution directe via $auth.
async function jeton() {
  try {
    return await $auth?.currentUser?.getIdToken()
  } catch {
    return null
  }
}

async function appel(url, options = {}) {
  const token = await jeton()
  const res = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  if (!res.ok) {
    const corps = await res.json().catch(() => ({}))
    const err = new Error(corps.message || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

async function charger() {
  chargement.value = true
  erreur.value = ''
  try {
    const { taches: liste } = await appel('/api/taches')
    taches.value = liste
  } catch (e) {
    erreur.value = `Impossible de charger les tâches : ${e.message}`
  } finally {
    chargement.value = false
  }
}

async function ajouter() {
  const titre = nouveauTitre.value.trim()
  if (!titre) return
  enregistre.value = true
  erreur.value = ''
  try {
    await appel('/api/taches', {
      method: 'POST',
      body: JSON.stringify({ titre, source: nouvelleSource.value }),
    })
    nouveauTitre.value = ''
    await charger()
  } catch (e) {
    erreur.value = e.message
  } finally {
    enregistre.value = false
  }
}

async function prendre(tache) {
  occupe.value = tache.id
  erreur.value = ''
  try {
    await appel(`/api/taches/${tache.id}/prendre`, { method: 'POST' })
    await charger()
  } catch (e) {
    // 409 = quelqu'un a été plus rapide : on recharge pour montrer la réalité
    erreur.value = e.message
    if (e.status === 409) await charger()
  } finally {
    occupe.value = null
  }
}

async function liberer(tache) {
  occupe.value = tache.id
  erreur.value = ''
  try {
    await appel(`/api/taches/${tache.id}/liberer`, { method: 'POST' })
    await charger()
  } catch (e) {
    erreur.value = e.message
  } finally {
    occupe.value = null
  }
}

async function supprimer(tache) {
  if (!confirm(`Supprimer la tâche « ${tache.titre} » ?\n\nCette action est irréversible.`)) return
  erreur.value = ''
  try {
    await appel(`/api/taches/${tache.id}`, { method: 'DELETE' })
    await charger()
  } catch (e) {
    erreur.value = e.message
  }
}

/** Carte déposée dans une autre colonne : on persiste le nouvel avancement. */
async function deplacer(evenement, nouveauStatut) {
  const carte = listes.value[nouveauStatut]?.[evenement.newIndex]
  if (!carte || carte.statut === nouveauStatut) return
  erreur.value = ''
  try {
    await appel(`/api/taches/${carte.id}`, {
      method: 'PUT',
      body: JSON.stringify({ statut: nouveauStatut }),
    })
    await charger()
  } catch (e) {
    erreur.value = e.message
    await charger()
  }
}
</script>

<style scoped>
.taches-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.taches-modal {
  background: #fff;
  border-radius: 14px;
  width: min(1100px, 100%);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
}
.taches-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.taches-header h2 {
  margin: 0;
  color: #064886;
  font-size: 1.4rem;
}
.taches-sub {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: #6b7280;
}
.taches-close {
  border: none;
  background: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #6b7280;
}
.taches-filtres {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 14px 0 10px;
}
.taches-filtre {
  border: 1.5px solid #ddd;
  background: #f9fafb;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 0.78rem;
  cursor: pointer;
}
.taches-filtre.actif {
  background: #064886;
  border-color: #064886;
  color: #fff;
  font-weight: 600;
}
.taches-mines {
  margin-left: auto;
  font-size: 0.78rem;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 5px;
}
.taches-ajout {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.taches-input,
.taches-select {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 0.85rem;
}
.taches-input { flex: 1; }
.taches-btn {
  background: #064886;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.taches-btn:disabled { opacity: 0.5; cursor: default; }
.taches-btn-second { background: #6b7280; }
.taches-btn-prendre { background: #15803d; }
.taches-erreur {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 0.82rem;
  margin: 0 0 10px;
}
.taches-vide {
  color: #6b7280;
  font-size: 0.85rem;
  padding: 24px 0;
  text-align: center;
}
.taches-colonnes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
@media (max-width: 760px) {
  .taches-colonnes { grid-template-columns: 1fr; }
}
.taches-colonne {
  background: #f3f4f6;
  border-radius: 10px;
  padding: 10px;
  min-width: 0;
}
.taches-colonne h3 {
  margin: 0 0 8px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #4b5563;
}
.taches-compte {
  background: #d1d5db;
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 0.72rem;
  margin-left: 4px;
}
.taches-liste { min-height: 60px; display: flex; flex-direction: column; gap: 8px; }
.taches-carte {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
  cursor: grab;
}
.taches-carte.prise { border-left: 3px solid #15803d; }
.taches-carte-ghost { opacity: 0.4; }
.taches-source {
  display: inline-block;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 4px;
  padding: 1px 6px;
  background: #e5e7eb;
  color: #374151;
}
.taches-source[data-source='service'] { background: #dbeafe; color: #1e40af; }
.taches-source[data-source='site'] { background: #fef3c7; color: #92400e; }
.taches-source[data-source='projet'] { background: #ede9fe; color: #5b21b6; }
.taches-titre {
  margin: 6px 0 4px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #111827;
}
.taches-dates { margin: 0 0 4px; font-size: 0.72rem; color: #6b7280; }
.taches-titulaire { margin: 0; font-size: 0.75rem; color: #15803d; font-weight: 600; }
.taches-libre { margin: 0; font-size: 0.75rem; color: #9ca3af; }
.taches-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}
.taches-supprimer {
  margin-left: auto;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.85rem;
  opacity: 0.6;
}
.taches-supprimer:hover { opacity: 1; }
</style>
