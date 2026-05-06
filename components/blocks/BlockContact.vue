<template>
  <section
    class="block-contact"
    :style="{ background: props.backgroundGradient, color: props.textColor || '#ffffff' }"
    :class="visibilityClasses"
    ref="sectionRef"
  >
    <div class="contact-inner">
      <h2 class="contact-title" :style="titleStyle">{{ props.title }}</h2>

      <div class="contact-wrap">
        <div class="contact-left">
          <img v-if="props.image" :src="props.image" alt="" class="contact-phone" :style="phoneStyle" />
          <div v-else class="contact-phone-placeholder"></div>
          
          <div class="contact-socials" v-if="props.showSocials" :style="fadeStyle">
            <a href="https://instagram.com/eglise_cieux_ouverts" target="_blank" rel="noopener" :style="{ color: props.textColor || '#ffffff' }">Instagram</a>
            <a href="https://facebook.com/eglisecieuxouverts" target="_blank" rel="noopener" :style="{ color: props.textColor || '#ffffff' }">Facebook</a>
          </div>
        </div>

        <div class="contact-right" :style="fadeStyle">
          <div class="contact-questions" ref="questionsRef" :style="questionsFadeStyle">
            <p>Tu as une question ?</p>
            <p>Tu désires parler à un pasteur ?</p>
            <p>Tu souhaites recevoir notre newsletter ?</p>
          </div>
          <form class="contact-form" @submit.prevent="submitForm">
            <div class="form-row">
              <input v-model="form.prenom" type="text" placeholder="Prénom *" required />
              <input v-model="form.nom" type="text" placeholder="Nom de famille *" required />
            </div>
            
            <input v-model="form.ville" type="text" placeholder="Ville" />
            <input v-model="form.email" type="email" placeholder="Email *" required />
            <textarea v-model="form.message" placeholder="Ton Message *" required rows="5"></textarea>

            <label class="checkbox-label">
              <input type="checkbox" v-model="form.newsletter" />
              Oui, je souhaite m'abonner à la Newsletter.
            </label>

            <p class="success-msg" v-if="submitted">Message envoyé, à bientôt !</p>
            <p class="error-msg" v-if="error">Une erreur est survenue.</p>
            
            <button type="submit" class="btn-submit" :disabled="sending">
              {{ sending ? 'Envoi...' : "C'est parti !" }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'

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
const questionsRef = ref(null)
const scrollProgress = ref(isEditor ? 1 : 0)

const onScroll = () => {
  if (isEditor || !sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  const vh = window.innerHeight
  const start = vh
  const end = vh * 0.4
  
  if (rect.top > start) {
    scrollProgress.value = 0
  } else if (rect.top < end) {
    scrollProgress.value = 1
  } else {
    scrollProgress.value = 1 - ((rect.top - end) / (start - end))
  }
}

onMounted(() => {
  if (isEditor) return
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => { if (!isEditor) window.removeEventListener('scroll', onScroll) })

const titleStyle = computed(() => {
  const p = scrollProgress.value
  const scale = 0.5 + (p * 0.5) // Scales from 0.5 to 1
  return {
    transform: `scale(${scale})`,
    opacity: p,
    transition: 'transform 0.1s linear, opacity 0.1s linear'
  }
})

const phoneStyle = computed(() => {
  const p = scrollProgress.value
  return {
    transform: `translateY(${100 * (1 - p)}px)`,
    opacity: p,
    transition: 'transform 0.1s linear, opacity 0.1s linear'
  }
})

const fadeStyle = computed(() => {
  const p = scrollProgress.value
  return {
    opacity: p,
    transform: `translateY(${50 * (1 - p)}px)`,
    transition: 'opacity 0.1s linear, transform 0.1s linear'
  }
})

const questionsFadeStyle = computed(() => {
  const p = scrollProgress.value
  // Apparaît dès qu'on arrive dessus et reste visible
  const op = Math.min(1, p * 2.5)
  return {
    opacity: op,
    transform: `translateY(${20 * (1 - op)}px)`,
    transition: 'opacity 0.1s linear, transform 0.1s linear'
  }
})

const { $db } = useNuxtApp()
const form = ref({ prenom: '', nom: '', ville: '', email: '', message: '', newsletter: false })
const sending = ref(false)
const submitted = ref(false)
const error = ref(false)

async function submitForm() {
  sending.value = true; error.value = false
  try {
    if (!$db) throw new Error("No DB")
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
    await addDoc(collection($db, 'contacts'), { ...form.value, createdAt: serverTimestamp() })
    submitted.value = true
    form.value = { prenom: '', nom: '', ville: '', email: '', message: '', newsletter: false }
  } catch (e) { 
    console.error(e)
    error.value = true 
  }
  finally { sending.value = false }
}
</script>

<style scoped>
.block-contact {
  container-type: inline-size;
  padding: 100px 24px;
}
.contact-inner { max-width: 1000px; margin: 0 auto; }
.contact-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2.5em, 5vw, 4em);
  text-align: center;
  margin-bottom: 60px;
  font-weight: 700;
  font-style: italic;
  will-change: transform, opacity;
}
.contact-wrap {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 60px;
  align-items: stretch;
}
.contact-left { display: flex; flex-direction: column; gap: 20px; }
.contact-phone {
  width: 100%;
  height: auto;
  border-radius: 12px;
  object-fit: cover;
  will-change: transform, opacity;
}
.contact-phone-placeholder { background: #000; width: 100%; min-height: 400px; }
.contact-socials { display: flex; gap: 20px; justify-content: center; will-change: transform, opacity; }
.contact-socials a { font-weight: 600; font-size: 1em; text-decoration: none; opacity: 0.9; transition: opacity 0.2s; }
.contact-socials a:hover { opacity: 1; }
.contact-right { display: flex; flex-direction: column; justify-content: center; will-change: transform, opacity; }

.contact-questions {
  margin-bottom: 20px;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 1.1em;
  font-weight: 600;
  line-height: 1.5;
  will-change: transform, opacity;
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
  .block-contact { padding: 40px 16px; }
}
</style>
