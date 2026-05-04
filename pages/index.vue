<template>
  <section class="hero">
    <img src="/foule-croix.png" alt="Foule et croix" class="hero-img" />
  </section>

  <section class="bienvenue-section">
    <h2 class="bienvenue-title">B I E<br>N V E<br>N U E</h2>
    <p class="bienvenue-subtitle">a lEglise Cieux Ouverts a Morlaix</p>
  </section>

  <section class="rejoins-section" ref="rejoinsRef">
    <div class="rejoins-inner">
      <p class="rejoins-text" :style="rejoinsTextStyle">
        <span class="rejoins-main">Rejoins-nous</span><br>
        <span class="rejoins-playfair">chaque dimanche</span>
      </p>
      <div class="rejoins-grid" :style="rejoinsGridStyle">
        <div class="rejoins-label"><span class="rejoins-playfair">Chaque dimanche a Morlaix</span></div>
        <div class="rejoins-horaire">
          <strong>9h30</strong>
          <span>Accueil café</span>
        </div>
        <div class="rejoins-horaire">
          <strong>10h00</strong>
          <span>Célébration</span>
        </div>
      </div>
    </div>
  </section>

  <section class="aspirations-section">
    <div class="aspirations-inner">
      <h2 class="aspirations-title">Nos aspirations</h2>
      <ul class="aspirations-list">
        <li>Accueillir et vivre l'unité</li>
        <li>Célébrer et cultiver la présence de Dieu</li>
        <li>Accompagner et restaurer les vies</li>
        <li>Témoigner et former des disciples</li>
      </ul>
      <div class="anime-inner" ref="animeRef" :style="animeStyle">
        <p class="anime-label">Ce qui nous anime</p>
        <p class="anime-quote">
          Voir la gloire, le royaume et la volonté de Dieu<br>
          se manifester sur la terre comme aux Cieux
        </p>
        <NuxtLink to="/contact" class="btn btn-outline">Nous rejoindre</NuxtLink>
      </div>
    </div>
  </section>

  <section class="contact-section">
    <div class="contact-inner">
      <h2 class="contact-title">Tu veux nous contacter ?</h2>
      <div class="contact-wrap">
        <div class="contact-left">
          <img src="/smartphone.jpg" alt="Smartphone" class="contact-phone" />
          <div class="contact-socials">
            <a href="https://instagram.com/eglise_cieux_ouverts" target="_blank" rel="noopener">
              <span>Instagram</span>
            </a>
            <a href="https://facebook.com/eglisecieuxouverts" target="_blank" rel="noopener">
              <span>Facebook</span>
            </a>
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
            <button type="submit" class="btn btn-primary" :disabled="sending">
              {{ sending ? 'Envoi...' : "C'est parti !" }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
useSeoMeta({
  title: 'Église Cieux Ouverts — Morlaix',
  description: "Bienvenue a lEglise Cieux Ouverts a Morlaix. Culte chaque dimanche a 10h.",
})

const rejoinsRef = ref(null)
const rejoinsProgress = ref(0)
const animeRef = ref(null)
const animeScale = ref(1)

onMounted(() => {
  window.addEventListener('scroll', () => {
    if (rejoinsRef.value) {
      const rect = rejoinsRef.value.getBoundingClientRect()
      const vh = window.innerHeight
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)))
      rejoinsProgress.value = progress
    }
    if (animeRef.value) {
      const rect = animeRef.value.getBoundingClientRect()
      const vh = window.innerHeight
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh * 0.5)))
      animeScale.value = 1 + progress * 0.5
    }
  })
})

const rejoinsTextStyle = computed(() => {
  const translateX = Math.min(0, -30 + (rejoinsProgress.value * 60))
  return { transform: `translateX(${translateX}%)`, transition: 'transform 0.1s linear' }
})
const rejoinsGridStyle = computed(() => {
  // Grid appears TOGETHER with text
  const opacity = Math.max(0, Math.min(1, rejoinsProgress.value * 2))
  const translateX = 20 - (rejoinsProgress.value * 20)
  return { 
    transform: `translateX(${translateX}%)`, 
    opacity, 
    transition: 'transform 0.1s linear, opacity 0.3s ease' 
  }
})
const animeStyle = computed(() => ({
  transform: `scale(${animeScale.value})`,
  transition: 'transform 0.1s linear'
}))

const { $db } = useNuxtApp()
const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
const form = ref({ prenom: '', nom: '', email: '', message: '', newsletter: false })
const sending = ref(false)
const submitted = ref(false)
const error = ref(false)

async function submitForm() {
  sending.value = true; error.value = false
  try {
    await addDoc(collection($db, 'contacts'), { ...form.value, createdAt: serverTimestamp() })
    submitted.value = true
    form.value = { prenom: '', nom: '', email: '', message: '', newsletter: false }
  } catch (e) { error.value = true }
  finally { sending.value = false }
}
</script>

<style>
:global(body) { background: #064886; }
:global(html) { margin: 0; padding: 0; }
</style>

<style scoped>
.hero {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  overflow: hidden;
  height: 500px;
}
.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.bienvenue-section {
  text-align: center;
  padding: 80px 20px 40px;
  background: transparent;
}
.bienvenue-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(3em, 10vw, 7em);
  font-style: italic;
  color: #1a1a2e;
  margin-bottom: 16px;
  line-height: 1.2;
}
.bienvenue-subtitle {
  font-size: clamp(1em, 2.5vw, 1.2em);
  color: #555;
  font-weight: 400;
}

.rejoins-section {
  background: linear-gradient(135deg, #3B82F6 0%, #7C3AED 50%, #EC4899 100%);
  padding: 100px 24px;
  color: white;
  overflow: hidden;
}
.rejoins-inner { max-width: 1100px; margin: 0 auto; overflow: hidden; }
.rejoins-text-wrapper { margin-bottom: 48px; }
.rejoins-text {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2em, 6vw, 4.5em);
  font-weight: 700;
  font-style: italic;
  line-height: 1.2;
  text-shadow: 0 2px 20px rgba(0,0,0,0.15);
  will-change: transform;
}
.rejoins-main { font-family: Helvetica, Arial, sans-serif; font-weight: 700; font-style: normal; }
.rejoins-playfair { font-family: 'Playfair Display', Georgia, serif; font-style: italic; }
.rejoins-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 32px;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
  will-change: transform, opacity;
}
.rejoins-label { font-size: clamp(0.9em, 2vw, 1.1em); opacity: 0.9; font-weight: 500; }
.rejoins-horaire { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.rejoins-horaire strong { font-size: clamp(1.8em, 5vw, 3em); font-weight: 900; line-height: 1; }
.rejoins-horaire span { font-size: 0.9em; opacity: 0.9; }

.aspirations-section {
  background: #064886;
  padding: 80px 20px;
  color: white;
}
.aspirations-inner { max-width: 1100px; margin: 0 auto; }
.aspirations-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2em, 5vw, 3em);
  font-style: italic;
  margin-bottom: 40px;
}
.aspirations-list {
  list-style: none;
  display: flex;
  flex-direction: column;
}
.aspirations-list li {
  font-size: 1.1em;
  padding: 22px 0 22px 36px;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  position: relative;
  line-height: 1.5;
}
.aspirations-list li:first-child { border-top: 1px solid rgba(255,255,255,0.15); }
.aspirations-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  border: 2px solid rgba(255,255,255,0.6);
}
.anime-inner {
  max-width: 720px;
  margin: 60px auto 0;
  text-align: center;
  will-change: transform;
}
.anime-label {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.85em;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.75);
  margin-bottom: 20px;
}
.anime-quote {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.2em, 3vw, 1.9em);
  font-style: italic;
  line-height: 1.65;
  color: white;
  margin: 0 auto 40px;
}
.btn-outline {
  display: inline-block;
  padding: 13px 36px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1em;
  text-decoration: none;
  background: transparent;
  color: white;
  border: 2px solid white;
  transition: background 0.2s, transform 0.2s;
}
.btn-outline:hover { background: rgba(255,255,255,0.15); transform: translateY(-2px); }

.contact-section {
  background: #064886;
  color: white;
  padding-bottom: 40px;
  margin-bottom: 0;
}
.contact-inner { max-width: 1100px; margin: 0 auto; }
.contact-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2em, 5vw, 3em);
  text-align: center;
  margin-bottom: 40px;
}
.contact-wrap {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 48px;
  align-items: start;
  margin-bottom: 40px;
}
.contact-left { display: flex; flex-direction: column; gap: 16px; }
.contact-phone { width: 100%; max-width: 200px; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
.contact-socials { display: flex; flex-direction: column; gap: 10px; }
.contact-socials a { display: flex; align-items: center; gap: 10px; color: white; font-weight: 600; font-size: 0.95em; text-decoration: none; }
.contact-socials a:hover { opacity: 0.7; }
.contact-form { display: flex; flex-direction: column; gap: 12px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.contact-form input,
.contact-form textarea {
  padding: 12px 14px;
  border: 1.5px solid rgba(255,255,255,0.3);
  border-radius: 10px;
  font-size: 0.95em;
  font-family: inherit;
  color: white;
  background: rgba(255,255,255,0.1);
  outline: none;
}
.contact-form input:focus,
.contact-form textarea:focus { border-color: rgba(255,255,255,0.7); }
.contact-form textarea { resize: vertical; min-height: 120px; }
.contact-form input::placeholder,
.contact-form textarea::placeholder { color: rgba(255,255,255,0.6); }
.checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 0.88em; cursor: pointer; opacity: 0.9; }
.checkbox-label input[type="checkbox"] { accent-color: #EC4899; }
.btn-primary {
  display: inline-block;
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
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
button[type=submit]:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
