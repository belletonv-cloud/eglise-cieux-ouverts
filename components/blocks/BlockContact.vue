<template>
  <section
    class="block-contact"
    :style="{ background: backgroundGradient, color: textColor || '#ffffff' }"
    :class="[visibilityClasses, { 'page-mode': isClassicPageContact }]"
  >
    <div v-if="isClassicPageContact" class="contact-page-shell">
      <section class="contact-page-header">
        <div class="contact-page-header-inner">
          <h2 class="contact-page-title" :style="fieldFontStyle(fieldFonts, 'title')">{{ title }}</h2>
          <div v-if="addressTitle || addressLine" class="contact-page-address">
            <p v-if="addressTitle" :style="fieldFontStyle(fieldFonts, 'addressTitle')">{{ addressTitle }}</p>
            <p v-if="addressLine" :style="fieldFontStyle(fieldFonts, 'addressLine')">{{ addressLine }}</p>
          </div>
        </div>
      </section>

      <section class="contact-page-main">
        <div class="contact-page-card">
          <div class="contact-page-card-inner">
            <div class="contact-page-form-col">
              <form class="contact-page-form" @submit.prevent="submitForm">
                <div class="contact-page-row">
                  <label class="contact-page-field">
                    <span>Prénom *</span>
                    <input v-model="form.prenom" type="text" autocomplete="given-name" maxlength="80" :disabled="isFormDisabled" required />
                  </label>
                  <label class="contact-page-field">
                    <span>Nom de famille *</span>
                    <input v-model="form.nom" type="text" autocomplete="family-name" maxlength="80" :disabled="isFormDisabled" required />
                  </label>
                </div>

                <label class="contact-page-field">
                  <span>Ville</span>
                  <input v-model="form.ville" type="text" autocomplete="address-level2" maxlength="120" :disabled="isFormDisabled" />
                </label>

                <label class="contact-page-field">
                  <span>Email *</span>
                  <input v-model="form.email" type="email" autocomplete="email" maxlength="180" :disabled="isFormDisabled" required />
                </label>

                <label class="contact-page-field">
                  <span>Ton message *</span>
                  <textarea v-model="form.message" maxlength="4000" :disabled="isFormDisabled" required rows="6"></textarea>
                </label>

                <input v-model="form.website" type="text" class="contact-honeypot" tabindex="-1" autocomplete="off" aria-hidden="true" />

                <label class="contact-page-checkbox">
                  <input type="checkbox" v-model="form.newsletter" :disabled="isFormDisabled" />
                  <span>Oui, je souhaite m'abonner à la newsletter.</span>
                </label>

                <p class="editor-msg" v-if="isEditor">Le formulaire est désactivé dans l'admin. Teste-le sur le site public.</p>
                <p class="success-msg" v-if="submitted">Message envoyé, à bientôt !</p>
                <p class="error-msg" v-if="errorMessage">{{ errorMessage }}</p>

                <div class="contact-page-submit">
                  <button type="submit" class="contact-page-btn" :disabled="isFormDisabled">
                    {{ sending ? 'Envoi...' : "C'est parti !" }}
                  </button>
                </div>
              </form>
            </div>

            <div class="contact-page-map-col">
              <iframe
                :src="mapEmbedUrl"
                title="Carte — Eglise Cieux Ouverts Morlaix"
                width="100%"
                height="100%"
                style="border:0;min-height:420px;"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="contact-inner">
      <h2 class="contact-title" :style="fieldFontStyle(fieldFonts, 'title')">{{ title }}</h2>

      <div class="contact-wrap">
        <div class="contact-left">
          <img v-if="image" :src="image" alt="" class="contact-phone" loading="lazy" />
          <div v-else class="contact-phone-placeholder"></div>

          <div class="contact-socials" v-if="showSocials">
            <a href="https://instagram.com/eglise_cieux_ouverts" target="_blank" rel="noopener" class="contact-social-icon" aria-label="Instagram Cieux Ouverts">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://facebook.com/eglisecieuxouverts" target="_blank" rel="noopener" class="contact-social-icon" aria-label="Facebook Cieux Ouverts">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
            </a>
          </div>
        </div>

        <div class="contact-right">
          <div class="contact-questions">
            <p v-if="showQuestions !== false">Tu as une question ?</p>
            <p v-if="showQuestions !== false">Tu désires parler à un pasteur ?</p>
            <p v-if="showQuestions !== false">Tu souhaites recevoir notre newsletter ?</p>
          </div>
          <form class="contact-form" @submit.prevent="submitForm">
            <div class="form-row">
              <input v-model="form.prenom" type="text" placeholder="Prénom *" autocomplete="given-name" maxlength="80" :disabled="isFormDisabled" required />
              <input v-model="form.nom" type="text" placeholder="Nom de famille *" autocomplete="family-name" maxlength="80" :disabled="isFormDisabled" required />
            </div>
            <input v-model="form.ville" type="text" placeholder="Ville" autocomplete="address-level2" maxlength="120" :disabled="isFormDisabled" />
            <input v-model="form.email" type="email" placeholder="Email *" autocomplete="email" maxlength="180" :disabled="isFormDisabled" required />
            <textarea v-model="form.message" placeholder="Ton Message *" maxlength="4000" :disabled="isFormDisabled" required rows="5"></textarea>
            <input v-model="form.website" type="text" class="contact-honeypot" tabindex="-1" autocomplete="off" aria-hidden="true" />
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.newsletter" :disabled="isFormDisabled" />
              Oui, je souhaite m'abonner à la Newsletter.
            </label>
            <p class="editor-msg" v-if="isEditor">Le formulaire est désactivé dans l'admin. Teste-le sur le site public.</p>
            <p class="success-msg" v-if="submitted">Message envoyé, à bientôt !</p>
            <p class="error-msg" v-if="errorMessage">{{ errorMessage }}</p>
            <button type="submit" class="btn-submit" :disabled="isFormDisabled">
              {{ sending ? 'Envoi...' : "C'est parti !" }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { fieldFontStyle } from '~/utils/fonts.js'

const {
  backgroundGradient = '',
  textColor = '#fff',
  title = '',
  addressTitle = '',
  addressLine = '',
  mapEmbedUrl = '',
  image = '',
  showSocials = false,
  showQuestions = false,
  visibility = {},
  fieldFonts = {},
} = defineProps({
  backgroundGradient: { type: String, default: '' },
  textColor: { type: String, default: '#fff' },
  title: { type: String, default: '' },
  addressTitle: { type: String, default: '' },
  addressLine: { type: String, default: '' },
  mapEmbedUrl: { type: String, default: '' },
  image: { type: String, default: '' },
  showSocials: { type: Boolean, default: false },
  showQuestions: { type: Boolean, default: false },
  visibility: { type: Object, default: () => ({}) },
  fieldFonts: { type: Object, default: () => ({}) },
})

const isEditor = inject('isEditor', false)

const visibilityClasses = computed(() => ({
  'hide-mobile': visibility.mobile === false,
  'hide-tablet': visibility.tablet === false,
  'hide-desktop': visibility.desktop === false,
}))

const route = useRoute()
const form = ref({ prenom: '', nom: '', ville: '', email: '', message: '', newsletter: false, website: '' })
const sending = ref(false)
const submitted = ref(false)
const errorMessage = ref('')
const mountedAt = Date.now()

const isFormDisabled = computed(() => sending.value)
const isClassicPageContact = computed(() => Boolean(mapEmbedUrl))

function normalizeForm() {
  return {
    prenom: form.value.prenom.trim(),
    nom: form.value.nom.trim(),
    ville: form.value.ville.trim(),
    email: form.value.email.trim().toLowerCase(),
    message: form.value.message.trim(),
    newsletter: Boolean(form.value.newsletter),
    website: form.value.website.trim(),
  }
}

function validateForm(data) {
  if (!data.prenom || !data.nom || !data.email || !data.message) {
    return 'Merci de renseigner les champs obligatoires.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return 'Merci de saisir une adresse email valide.'
  }
  if (data.message.length < 10) {
    return 'Ton message est un peu trop court.'
  }
  if (data.website) {
    return 'Envoi bloqué.'
  }
  if (Date.now() - mountedAt < 2500) {
    return 'Merci de patienter une seconde avant d\'envoyer le formulaire.'
  }
  return ''
}

async function submitForm() {
  if (isEditor === true) return
  const data = normalizeForm()
  const validationError = validateForm(data)
  if (validationError) {
    errorMessage.value = validationError
    return
  }

  sending.value = true
  errorMessage.value = ''
  submitted.value = false
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        prenom: data.prenom,
        nom: data.nom,
        ville: data.ville,
        email: data.email,
        message: data.message,
        newsletter: data.newsletter,
        website: data.website,
        source: route.fullPath,
      },
    })
    submitted.value = true
    form.value = { prenom: '', nom: '', ville: '', email: '', message: '', newsletter: false, website: '' }
  } catch (e) {
    console.error(e)
    // createError({ message }) côté serveur (server/api/contact.post.ts) place le
    // texte dans data.message — data.statusMessage ne contient que la formule HTTP
    // générique associée au code (ex. "Server Error" pour 503), pas le vrai message.
    errorMessage.value = e?.data?.message || 'L\'envoi a echoue. Verifie la connexion ou reessaie dans un instant.'
  } finally { sending.value = false }
}
</script>

<style scoped>
.block-contact {
  view-timeline: --contact;
  container-type: inline-size;
  padding: 70px 24px;
}
.block-contact.page-mode {
  padding: 0;
  background: white !important;
  color: #1a1a2e !important;
}
.contact-page-shell {
  background: white;
  color: #1a1a2e;
}
.contact-page-header {
  background: white;
  padding: 60px 48px 30px;
}
.contact-page-header-inner {
  display: flex;
  align-items: flex-start;
  gap: 60px;
  max-width: 1100px;
  margin: 0 auto;
}
.contact-page-title {
  margin: 0;
  flex-shrink: 0;
  font-family: var(--font-heading);
  font-style: italic;
  font-size: 2.8em;
  font-weight: 700;
  color: #064886;
}
.contact-page-address {
  padding-top: 10px;
}
.contact-page-address p {
  margin: 0;
  font-size: 1em;
  color: #064886;
  font-style: italic;
  line-height: 1.7;
  font-family: var(--font-heading);
}
.contact-page-main {
  background: white;
}
.contact-page-card {
  background: #064886;
  margin: 0 48px 80px;
  padding: 40px 48px 60px;
  border-radius: 12px;
}
.contact-page-card-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto;
  align-items: stretch;
}
.contact-page-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.contact-page-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.contact-page-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.contact-page-field span {
  font-size: 0.82em;
  font-weight: 500;
  color: white;
}
.contact-page-field input,
.contact-page-field textarea {
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
.contact-page-field input:focus,
.contact-page-field textarea:focus {
  box-shadow: 0 0 0 2px rgba(255,255,255,0.5);
}
.contact-page-field textarea {
  resize: vertical;
  min-height: 120px;
}
.contact-page-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.88em;
  color: rgb(238, 108, 113);
  font-weight: 600;
  cursor: pointer;
}
.contact-page-checkbox input {
  margin-top: 2px;
  accent-color: rgb(238, 108, 113);
}
.contact-page-submit {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}
.contact-page-btn {
  padding: 12px 40px;
  background: rgb(26, 150, 223);
  color: white;
  font-size: 1em;
  font-weight: 700;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.contact-page-btn:hover { background: rgb(238, 108, 113); }
.contact-page-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.contact-page-map-col {
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.contact-inner { max-width: 1000px; margin: 0 auto; }

/* ── Title ── */
.contact-title {
  font-family: var(--font-heading);
  font-size: clamp(2.5em, 5vw, 4em);
  text-align: center;
  margin-bottom: 60px;
  font-weight: 700;
  font-style: italic;
  animation: ct-title-in both;
  animation-timeline: --contact;
  animation-range: entry 0% entry 60%;
}

/* ── Left col ── */
.contact-phone {
  width: 100%;
  height: auto;
  border-radius: 12px;
  object-fit: cover;
  animation: ct-phone-in both;
  animation-timeline: --contact;
  animation-range: entry 5% entry 65%;
}

.contact-socials {
  display: flex; gap: 14px; justify-content: center;
  animation: ct-fade-in both;
  animation-timeline: --contact;
  animation-range: entry 25% entry 75%;
}
.contact-social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  color: white;
  transition: background 0.2s, transform 0.2s;
}
.contact-social-icon:hover { background: rgba(255,255,255,0.3); transform: scale(1.1); }

/* ── Right col ── */
.contact-right {
  display: flex; flex-direction: column; justify-content: center;
  animation: ct-right-in both;
  animation-timeline: --contact;
  animation-range: entry 10% entry 70%;
}

@keyframes ct-title-in {
  0%   { opacity: 0; transform: scale(0.6); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes ct-phone-in {
  0%   { opacity: 0; transform: translateY(80px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes ct-fade-in {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes ct-right-in {
  0%   { opacity: 0; transform: translateX(80px); }
  100% { opacity: 1; transform: translateX(0); }
}

.contact-wrap {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 60px;
  align-items: stretch;
}
.contact-left { display: flex; flex-direction: column; gap: 20px; }
.contact-phone-placeholder { background: #000; width: 100%; min-height: 400px; }
.contact-socials a { font-weight: 600; font-size: 1em; text-decoration: none; opacity: 0.9; transition: opacity 0.2s; }
.contact-socials a:hover { opacity: 1; }

.contact-questions {
  margin-bottom: 20px;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 1.1em;
  font-weight: 600;
  line-height: 1.5;
}
.contact-questions p { margin: 0 0 5px 0; }
.contact-questions:empty { display: none; }

.contact-form { display: flex; flex-direction: column; gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.contact-form input,
.contact-form textarea {
  padding: 14px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.95em;
  font-family: inherit;
  color: #1a1a2e;
  background: white;
  outline: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}
.contact-form textarea { resize: vertical; min-height: 150px; }
.contact-form input::placeholder,
.contact-form textarea::placeholder { color: #888; }
.checkbox-label { display: flex; align-items: center; gap: 10px; font-size: 0.9em; cursor: pointer; opacity: 0.9; margin-top: 10px; margin-bottom: 10px; color: rgb(238, 108, 113); font-weight: 600; }
.checkbox-label input[type="checkbox"] { width: 18px; height: 18px; accent-color: rgb(238, 108, 113); }
.contact-honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
.editor-msg { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); border-radius: 8px; padding: 12px; font-size: 0.9em; }
.success-msg { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); border-radius: 8px; padding: 12px; font-size: 0.9em; }
.error-msg { background: rgba(239,75,84,0.25); border: 1px solid rgba(239,75,84,0.5); border-radius: 8px; padding: 12px; font-size: 0.9em; }
.btn-submit {
  align-self: flex-start;
  padding: 14px 40px;
  background: rgb(26, 150, 223);
  color: white;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1em;
  cursor: pointer;
  border: none;
  transition: transform 0.2s, background 0.2s;
}
.btn-submit:hover { transform: translateY(-2px); background: rgb(238, 108, 113); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

@container (max-width: 768px) {
  .contact-page-header { padding: 40px 20px 20px; }
  .contact-page-header-inner { flex-direction: column; gap: 16px; }
  .contact-page-title { font-size: 2em; }
  .contact-page-card { margin: 0 16px 60px; padding: 24px 20px 40px; }
  .contact-page-card-inner { grid-template-columns: 1fr; }
  .contact-page-row { grid-template-columns: 1fr; }
  .contact-page-map-col iframe { min-height: 280px !important; }
  .contact-wrap { grid-template-columns: 1fr; gap: 40px; }
  .contact-phone { max-width: 200px; margin: 0 auto; }
  .form-row { grid-template-columns: 1fr; }
}
@container (max-width: 600px) {
  .block-contact { padding: 50px 20px; }
}
</style>
