<template>
  <section
    class="block-contact"
    :style="{ background: props.backgroundGradient }"
    :class="visibilityClasses"
  >
    <div class="contact-inner">
      <h2 class="contact-title">{{ props.title }}</h2>
      <div class="contact-wrap">
        <div class="contact-left">
          <img v-if="props.image" :src="props.image" alt="" class="contact-phone" />
          <div v-if="props.showSocials" class="contact-socials">
            <a href="https://instagram.com/eglise_cieux_ouverts" target="_blank" rel="noopener">Instagram</a>
            <a href="https://facebook.com/eglisecieuxouverts" target="_blank" rel="noopener">Facebook</a>
          </div>
        </div>
        <div class="contact-right">
          <form @submit.prevent="submitForm" class="contact-form">
            <div class="form-row">
              <input v-model="form.prenom" type="text" placeholder="Prénom *" required />
              <input v-model="form.nom" type="text" placeholder="Nom *" required />
            </div>
            <input v-model="form.email" type="email" placeholder="Email *" required />
            <textarea v-model="form.message" placeholder="Ton Message *" required rows="5"></textarea>
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.newsletter" />
              Oui, je souhaite m'abonner à la Newsletter.
            </label>
            <div v-if="submitted" class="success-msg">✅ Message envoyé ! Nous reviendrons vers toi très bientôt.</div>
            <div v-if="error" class="error-msg">❌ Une erreur s'est produite. Merci de réessayer.</div>
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
const p = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})

const visibilityClasses = computed(() => ({
  'hide-mobile': p.visibility.mobile === false,
  'hide-tablet': p.visibility.tablet === false,
  'hide-desktop': p.visibility.desktop === false,
}))

const { $db } = useNuxtApp()
const form = ref({ prenom: '', nom: '', email: '', message: '', newsletter: false })
const sending = ref(false)
const submitted = ref(false)
const error = ref(false)

async function submitForm() {
  sending.value = true; error.value = false
  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
    await addDoc(collection($db, 'contacts'), { ...form.value, createdAt: serverTimestamp() })
    submitted.value = true
    form.value = { prenom: '', nom: '', email: '', message: '', newsletter: false }
  } catch (e) { error.value = true }
  finally { sending.value = false }
}
</script>

<style scoped>
.block-contact {
  color: white;
  padding: 60px 20px 80px;
}
.contact-inner { max-width: 1100px; margin: 0 auto; }
.contact-title {
  font-family: Georgia, serif;
  font-size: clamp(2em, 5vw, 3em);
  text-align: center;
  margin-bottom: 40px;
  font-weight: 700;
}
.contact-wrap {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 48px;
  align-items: start;
}
.contact-left { display: flex; flex-direction: column; gap: 16px; }
.contact-phone { width: 100%; max-width: 180px; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
.contact-socials { display: flex; flex-direction: column; gap: 10px; }
.contact-socials a { color: white; font-weight: 600; font-size: 0.95em; text-decoration: none; opacity: 0.9; }
.contact-socials a:hover { opacity: 1; text-decoration: underline; }
.contact-form { display: flex; flex-direction: column; gap: 12px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.contact-form input,
.contact-form textarea {
  padding: 12px 14px;
  border: 1.5px solid rgba(255,255,255,0.35);
  border-radius: 10px;
  font-size: 0.95em;
  font-family: inherit;
  color: white;
  background: rgba(255,255,255,0.12);
  outline: none;
}
.contact-form input:focus,
.contact-form textarea:focus { border-color: rgba(255,255,255,0.8); }
.contact-form textarea { resize: vertical; min-height: 120px; }
.contact-form input::placeholder,
.contact-form textarea::placeholder { color: rgba(255,255,255,0.65); }
.checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 0.88em; cursor: pointer; opacity: 0.9; }
.checkbox-label input[type="checkbox"] { accent-color: #EC4899; }
.success-msg { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); border-radius: 8px; padding: 12px; font-size: 0.9em; }
.error-msg { background: rgba(239,75,84,0.25); border: 1px solid rgba(239,75,84,0.5); border-radius: 8px; padding: 12px; font-size: 0.9em; }
.btn-submit {
  padding: 13px 30px;
  background: #EF4B54;
  color: white;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1em;
  cursor: pointer;
  border: none;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-submit:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
@media (max-width: 768px) {
  .contact-wrap { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
