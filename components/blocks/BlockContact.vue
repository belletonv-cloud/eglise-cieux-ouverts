<template>
  <section
    class="block-contact"
    :style="{ background: props.backgroundGradient, color: props.textColor || '#ffffff' }"
    :class="[visibilityClasses, { 'is-visible': isVisible }]"
    ref="sectionRef"
  >
    <div class="contact-inner">
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
            <p>Tu as une question ?</p>
            <p>Tu désires parler à un pasteur ?</p>
            <p>Tu souhaites recevoir notre newsletter ?</p>
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
  .contact-wrap { grid-template-columns: 1fr; gap: 40px; }
  .contact-phone { max-width: 200px; margin: 0 auto; }
  .form-row { grid-template-columns: 1fr; }
}
@container (max-width: 600px) {
  .block-contact { padding: 50px 20px; }
}
</style>
