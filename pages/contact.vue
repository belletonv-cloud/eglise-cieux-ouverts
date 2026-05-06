<template>
  <div class="page-contact">
    <!-- Header -->
    <section class="contact-header">
      <div class="contact-header-inner">
        <h1 class="contact-title">Nous contacter</h1>
        <div class="contact-address">
          <p>Église Cieux Ouverts</p>
          <p>2 rue Jean Monnet | 29600 Morlaix</p>
        </div>
      </div>
    </section>

    <!-- Main form + map section -->
    <section class="contact-main">
      <div class="contact-inner">
        <!-- Left: form -->
        <div class="contact-form-col">
          <form @submit.prevent="submitForm" class="contact-form">
            <div class="form-row">
              <div class="form-group">
                <label for="prenom">Prénom *</label>
                <input id="prenom" v-model="form.prenom" type="text" required />
              </div>
              <div class="form-group">
                <label for="nom">Nom de famille *</label>
                <input id="nom" v-model="form.nom" type="text" required />
              </div>
            </div>

            <div class="form-group">
              <label for="ville">Ville</label>
              <input id="ville" v-model="form.ville" type="text" />
            </div>

            <div class="form-group">
              <label for="email">Email *</label>
              <input id="email" v-model="form.email" type="email" required />
            </div>

            <div class="form-group">
                <label for="message">Ton message *</label>
              <textarea id="message" v-model="form.message" required rows="6"></textarea>
            </div>

            <label class="checkbox-label">
              <input type="checkbox" v-model="form.newsletter" />
              <span>Oui, je souhaite m'abonner à la newsletter.</span>
            </label>

            <div v-if="submitted" class="success-msg">
              ✅ Message envoyé ! Nous reviendrons vers toi très bientôt.
            </div>
            <div v-if="error" class="error-msg">
              ❌ Une erreur s'est produite. Merci de réessayer.
            </div>

            <div class="form-submit">
              <button type="submit" class="btn-submit" :disabled="sending">
                {{ sending ? 'Envoi...' : "C'est parti !" }}
              </button>
            </div>
          </form>
        </div>

        <!-- Right: map -->
        <div class="contact-map-col">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2688.0!2d-3.8275!3d48.5775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4816a3c4e3d89c3b%3A0x1!2s2+Rue+Jean+Monnet%2C+29600+Morlaix!5e0!3m2!1sfr!2sfr!4v1700000000000"
            title="Carte — Église Cieux Ouverts Morlaix"
            width="100%"
            height="100%"
            style="border:0;min-height:420px;"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useSeoMeta({
  title: "Contact — Église Cieux Ouverts Morlaix",
  description: "Contactez l'Église Cieux Ouverts à Morlaix. 2 rue Jean Monnet, 29600 Morlaix.",
})

const { $db } = useNuxtApp()

const form = ref({ prenom: '', nom: '', email: '', ville: '', message: '', newsletter: false })
const sending = ref(false)
const submitted = ref(false)
const error = ref(false)

async function submitForm() {
  sending.value = true
  error.value = false
  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
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
.page-contact {
  background: white;
}

/* Header */
.contact-header {
  background: white;
  padding: 60px 48px 30px;
}

.contact-header-inner {
  display: flex;
  align-items: flex-start;
  gap: 60px;
  max-width: 1100px;
}

.contact-title {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 2.8em;
  font-weight: 700;
  color: #064886;
  margin: 0;
  flex-shrink: 0;
}

.contact-address {
  padding-top: 10px;
}

.contact-address p {
  margin: 0;
  font-size: 1em;
  color: #064886;
  font-style: italic;
  line-height: 1.7;
  font-family: 'Playfair Display', serif;
}

/* Main section */
.contact-main {
  background: #064886;
  padding: 40px 48px 60px;
  margin: 0 48px 80px; /* Ajout d'un espace en bas avant le footer */
  border-radius: 12px;
}

.contact-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto;
  align-items: stretch;
}

/* Form */
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 0.82em;
  font-weight: 500;
  color: white;
}

.form-group input,
.form-group textarea {
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.95em;
  font-family: inherit;
  color: #333;
  background: white;
  outline: none;
  transition: box-shadow 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  box-shadow: 0 0 0 2px rgba(255,255,255,0.5);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.88em;
  color: #EF4B54;
  font-weight: 600;
  cursor: pointer;
}

.checkbox-label input {
  margin-top: 2px;
  accent-color: #EF4B54;
}

.form-submit {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}

.btn-submit {
  padding: 12px 40px;
  background: #3B82F6;
  color: white;
  font-size: 1em;
  font-weight: 700;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-submit:hover { background: #2563eb; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.success-msg {
  background: rgba(255,255,255,0.15);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 0.9em;
}

.error-msg {
  background: rgba(239,75,84,0.2);
  color: white;
  border: 1px solid rgba(239,75,84,0.4);
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 0.9em;
}

/* Map */
.contact-map-col {
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (max-width: 900px) {
  .contact-header { padding: 40px 20px 20px; }
  .contact-header-inner { flex-direction: column; gap: 16px; }
  .contact-main { margin: 0 16px 60px; padding: 24px 20px 40px; }
  .contact-inner { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
  .contact-map-col iframe { min-height: 280px !important; }
}
</style>
