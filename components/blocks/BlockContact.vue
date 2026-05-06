<template>
  <section
    class="block-contact"
    :style="{ background: props.backgroundGradient, color: props.textColor || '#ffffff' }"
    :class="[visibilityClasses, { 'is-visible': isVisible, 'page-mode': isClassicPageContact }]"
    ref="sectionRef"
  >
    <div v-if="isClassicPageContact" class="contact-page-shell">
      <section class="contact-page-header">
        <div class="contact-page-header-inner">
          <h2 class="contact-page-title">{{ props.title }}</h2>
          <div v-if="props.addressTitle || props.addressLine" class="contact-page-address">
            <p v-if="props.addressTitle">{{ props.addressTitle }}</p>
            <p v-if="props.addressLine">{{ props.addressLine }}</p>
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
                :src="props.mapEmbedUrl"
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
      <h2 class="contact-title">{{ props.title }}</h2>

      <div class="contact-wrap">
        <div class="contact-left">
          <img v-if="props.image" :src="props.image" alt="" class="contact-phone" />
          <div v-else class="contact-phone-placeholder"></div>

          <div class="contact-socials" v-if="props.showSocials">
            <a href="https://instagram.com/eglise_cieux_ouverts" target="_blank" rel="noopener" :style="{ color: props.textColor || '#ffffff' }">Instagram</a>
            <a href="https://facebook.com/eglisecieuxouverts" target="_blank" rel="noopener" :style="{ color: props.textColor || '#ffffff' }">Facebook</a>
          </div>
        </div>

        <div class="contact-right">
          <div class="contact-questions">
            <p v-if="props.showQuestions !== false">Tu as une question ?</p>
            <p v-if="props.showQuestions !== false">Tu désires parler à un pasteur ?</p>
            <p v-if="props.showQuestions !== false">Tu souhaites recevoir notre newsletter ?</p>
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
import { ref, computed, inject, onMounted } from 'vue'

const p = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})

const isEditor = inject('isEditor', false)

const visibilityClasses = computed(() => ({
  'hide-mobile': p.visibility.mobile === false,
  'hide-tablet': p.visibility.tablet === false,
  'hide-desktop': p.visibility.desktop === false,
}))

const sectionRef = ref(null)
const isVisible = ref(false)

onMounted(() => {
  if (isEditor) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isVisible.value = true
      })
    })
    return
  }
  const observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) { isVisible.value = true; observer.disconnect() } },
    { threshold: 0.15 }
  )
  if (sectionRef.value) observer.observe(sectionRef.value)
})

const route = useRoute()
const form = ref({ prenom: '', nom: '', ville: '', email: '', message: '', newsletter: false, website: '' })
const sending = ref(false)
const submitted = ref(false)
const errorMessage = ref('')
const mountedAt = Date.now()

const isFormDisabled = computed(() => sending.value || isEditor)
const isClassicPageContact = computed(() => Boolean(p.props.mapEmbedUrl))

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
    errorMessage.value = e?.data?.statusMessage || 'L\'envoi a echoue. Verifie la connexion ou reessaie dans un instant.'
  } finally { sending.value = false }
}
</script>

<style scoped>
.block-contact {
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
  font-family: 'Playfair Display', Georgia, serif;
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
  font-family: 'Playfair Display', Georgia, serif;
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
  color: #EF4B54;
  font-weight: 600;
  cursor: pointer;
}
.contact-page-checkbox input {
  margin-top: 2px;
  accent-color: #EF4B54;
}
.contact-page-submit {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}
.contact-page-btn {
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
.contact-page-btn:hover { background: #2563eb; }
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
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2.5em, 5vw, 4em);
  text-align: center;
  margin-bottom: 60px;
  font-weight: 700;
  font-style: italic;
  will-change: transform, opacity;
  opacity: 0;
  transform: scale(0.6);
  transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1),
              transform 0.9s cubic-bezier(0.16,1,0.3,1);
  transition-delay: 0s;
}

/* ── Left col ── */
.contact-phone {
  width: 100%;
  height: auto;
  border-radius: 12px;
  object-fit: cover;
  will-change: transform, opacity;
  opacity: 0;
  transform: translateY(80px);
  transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1),
              transform 0.8s cubic-bezier(0.16,1,0.3,1);
  transition-delay: 0.15s;
}

.contact-socials {
  display: flex; gap: 20px; justify-content: center;
  will-change: opacity;
  opacity: 0;
  transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1);
  transition-delay: 0.4s;
}

/* ── Right col ── */
.contact-right {
  display: flex; flex-direction: column; justify-content: center;
  will-change: transform, opacity;
  opacity: 0;
  transform: translateX(80px);
  transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1),
              transform 0.8s cubic-bezier(0.16,1,0.3,1);
  transition-delay: 0.1s;
}

/* ── Triggered ── */
.is-visible .contact-title,
.is-visible .contact-phone,
.is-visible .contact-socials,
.is-visible .contact-right {
  opacity: 1;
  transform: none;
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
.checkbox-label { display: flex; align-items: center; gap: 10px; font-size: 0.9em; cursor: pointer; opacity: 0.9; margin-top: 10px; margin-bottom: 10px; }
.checkbox-label input[type="checkbox"] { width: 18px; height: 18px; accent-color: #3B82F6; }
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
  background: white;
  color: #064886;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.1em;
  cursor: pointer;
  border: none;
  transition: transform 0.2s, background 0.2s;
}
.btn-submit:hover { transform: translateY(-2px); background: #f0f0f0; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

@container (max-width: 768px) {
  .contact-page-header { padding: 40px 20px 20px; }
  .contact-page-header-inner { flex-direction: column; gap: 16px; }
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
