<template>
  <div class="page-contact">
    <div class="page-hero">
      <h1>Contact</h1>
      <p>Il y a une place pour toi !</p>
    </div>

    <section class="section">
      <div class="contact-grid">
        <div class="contact-form-wrap card">
          <h2>Tu veux nous contacter ?</h2>
          <p class="form-intro">
            Tu as une question ? Tu désires parler à un pasteur ?<br>
            Tu souhaites recevoir notre newsletter ?
          </p>

          <form @submit.prevent="submitForm" class="contact-form">
            <div class="form-row">
              <div class="form-group">
                <label for="prenom">Prénom *</label>
                <input id="prenom" v-model="form.prenom" type="text" required placeholder="Marie" />
              </div>
              <div class="form-group">
                <label for="nom">Nom *</label>
                <input id="nom" v-model="form.nom" type="text" required placeholder="Dupont" />
              </div>
            </div>
            <div class="form-group">
              <label for="email">Email *</label>
              <input id="email" v-model="form.email" type="email" required placeholder="marie@exemple.fr" />
            </div>
            <div class="form-group">
              <label for="ville">Ville</label>
              <input id="ville" v-model="form.ville" type="text" placeholder="Morlaix" />
            </div>
            <div class="form-group">
              <label for="message">Ton message *</label>
              <textarea id="message" v-model="form.message" required rows="5" placeholder="Bonjour..."></textarea>
            </div>
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.newsletter" />
              <span>Oui, je souhaite m'abonner à la Newsletter</span>
            </label>

            <div v-if="submitted" class="success-msg">
              ✅ Message envoyé ! Nous reviendrons vers toi très bientôt.
            </div>
            <div v-if="error" class="error-msg">
              ❌ Une erreur s'est produite. Merci de réessayer.
            </div>

            <button type="submit" class="btn btn-primary" :disabled="sending">
              {{ sending ? 'Envoi...' : "C'est parti !" }}
            </button>
          </form>
        </div>

        <div class="contact-info">
          <div class="card info-block">
            <div class="info-icon">📍</div>
            <div>
              <h3>Adresse</h3>
              <p>2 rue Jean Monnet<br>29600 Morlaix, Bretagne</p>
              <a href="https://maps.google.com/?q=2+rue+Jean+Monnet+29600+Morlaix" target="_blank" rel="noopener" class="maps-link">Ouvrir dans Google Maps →</a>
            </div>
          </div>

          <div class="card info-block">
            <div class="info-icon">🕙</div>
            <div>
              <h3>Horaires</h3>
              <p><strong>Chaque dimanche</strong></p>
              <p>9h30 — Accueil café</p>
              <p>10h00 — Célébration</p>
            </div>
          </div>

          <div class="card info-block">
            <div class="info-icon">✉️</div>
            <div>
              <h3>Email</h3>
              <a href="mailto:contact@cieuxouverts.bzh">contact@cieuxouverts.bzh</a>
            </div>
          </div>

          <div class="card info-block">
            <div class="info-icon">📱</div>
            <div>
              <h3>Réseaux sociaux</h3>
              <div class="socials">
                <a href="https://www.facebook.com/eglisecieuxouverts" target="_blank" rel="noopener">Facebook</a>
                <a href="https://www.instagram.com/eglise_cieux_ouverts/" target="_blank" rel="noopener">Instagram</a>
              </div>
            </div>
          </div>

          <div class="map-wrap">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2688.0!2d-3.8275!3d48.5775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4816a3c4e3d89c3b%3A0x1!2s2+Rue+Jean+Monnet%2C+29600+Morlaix!5e0!3m2!1sfr!2sfr!4v1700000000000"
              title="Carte — Église Cieux Ouverts Morlaix"
              width="100%"
              height="260"
              style="border:0;border-radius:14px;"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Contact — Église Cieux Ouverts Morlaix',
  description: 'Contactez l\'Église Cieux Ouverts à Morlaix. 2 rue Jean Monnet, 29600 Morlaix.',
})

const { $db } = useNuxtApp()
const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')

const form = ref({ prenom: '', nom: '', email: '', ville: '', message: '', newsletter: false })
const sending = ref(false)
const submitted = ref(false)
const error = ref(false)

async function submitForm() {
  sending.value = true
  error.value = false
  try {
    await addDoc(collection($db, 'contacts'), { ...form.value, createdAt: serverTimestamp() })
    submitted.value = true
    form.value = { prenom: '', nom: '', email: '', ville: '', message: '', newsletter: false }
  } catch (e) {
    console.error(e)
    error.value = true
  } finally {
    sending.value = false
  }
}
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

.contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }

.contact-form-wrap h2 { font-size: 1.5em; font-weight: 700; margin-bottom: 10px; color: var(--text-dark); }

.form-intro { color: var(--text-gray); font-size: 0.9em; margin-bottom: 24px; line-height: 1.6; }

.contact-form { display: flex; flex-direction: column; gap: 16px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-group label { font-size: 0.88em; font-weight: 600; color: var(--text-dark); }

.form-group input,
.form-group textarea {
  padding: 11px 14px;
  border: 1.5px solid var(--border-light);
  border-radius: 10px;
  font-size: 0.95em;
  font-family: inherit;
  color: var(--text-dark);
  background: white;
  transition: border-color 0.2s;
  outline: none;
}
.form-group input:focus,
.form-group textarea:focus { border-color: var(--primary-purple); }
.form-group textarea { resize: vertical; min-height: 120px; }

.checkbox-label { display: flex; align-items: flex-start; gap: 10px; font-size: 0.88em; color: var(--text-gray); cursor: pointer; }
.checkbox-label input { margin-top: 2px; }

.success-msg { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px 16px; font-size: 0.95em; }
.error-msg { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; border-radius: 10px; padding: 14px 16px; font-size: 0.95em; }

button[type=submit]:disabled { opacity: 0.6; cursor: not-allowed; }

.contact-info { display: flex; flex-direction: column; gap: 16px; }

.info-block { display: flex; gap: 16px; align-items: flex-start; padding: 20px 24px; }
.info-icon { font-size: 1.6em; flex-shrink: 0; }

.info-block h3 { font-size: 1em; font-weight: 700; color: var(--primary-purple); margin-bottom: 6px; }
.info-block p { color: var(--text-gray); font-size: 0.9em; line-height: 1.6; }

.maps-link { display: inline-block; margin-top: 8px; font-size: 0.85em; font-weight: 600; color: var(--primary-purple); }
.maps-link:hover { text-decoration: underline; }

.socials { display: flex; gap: 14px; margin-top: 4px; }
.socials a { font-size: 0.9em; font-weight: 600; color: var(--primary-purple); }

.map-wrap { border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(124,58,237,0.1); }

@media (max-width: 900px) {
  .contact-grid { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
