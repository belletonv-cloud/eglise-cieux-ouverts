<template>
  <div class="page-container">
    <h1 class="page-title">Gallerie Photos</h1>
    <p class="page-subtitle">Quelques moments de vie de l'église.</p>
    
    <section class="slideshow">
      <div class="slides-track" :style="trackStyle">
        <img v-for="(p, i) in allPhotos" :key="i" :src="p.src" :alt="p.alt" />
      </div>
      <button class="slide-btn prev" @click="prev" aria-label="Précédent">&#8592;</button>
      <button class="slide-btn next" @click="next" aria-label="Suivant">&#8594;</button>
      <div class="slide-dots">
        <button
          v-for="(p, i) in photos"
          :key="i"
          :class="{ active: current === i }"
          @click="goTo(i)"
          :aria-label="'Photo ' + (i+1)"
        ></button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

import photoSalle from '@/assets/photos/salle.jpg'
import photoMains from '@/assets/photos/mains.jpg'
import photoPromenade from '@/assets/photos/promenade.jpg'
import photoPizza from '@/assets/photos/pizza.jpg'
import photoBuffet from '@/assets/photos/buffet.jpg'

const photos = [
  { src: photoSalle, alt: 'Salle de l\'église' },
  { src: photoMains, alt: 'Mains jointes' },
  { src: photoPromenade, alt: 'Promenade en groupe' },
  { src: photoPizza, alt: 'Repas en groupe' },
  { src: photoBuffet, alt: 'Buffet' },
]

const allPhotos = computed(() => [photos[photos.length - 1], ...photos, photos[0]])
const current = ref(0)
const transitioning = ref(true)
let timer

const trackStyle = computed(() => ({
  transform: `translateX(-${(current.value + 1) * 100}%)`,
  transition: transitioning.value ? 'transform 0.6s ease' : 'none'
}))

function next() {
  transitioning.value = true
  current.value++
  if (current.value >= photos.length) {
    setTimeout(() => {
      transitioning.value = false
      current.value = 0
    }, 600)
  }
}

function prev() {
  transitioning.value = true
  current.value--
  if (current.value < 0) {
    setTimeout(() => {
      transitioning.value = false
      current.value = photos.length - 1
    }, 600)
  }
}

function goTo(i) { 
  transitioning.value = true; 
  current.value = i 
}

onMounted(() => { timer = setInterval(next, 5000) })
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.page-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px;
  text-align: center;
}

.page-title {
  font-size: 2.5em;
  font-weight: 700;
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 1.1em;
  color: var(--text-medium);
  margin-bottom: 40px;
}

.slideshow {
  position: relative;
  overflow: hidden;
  height: 600px;
  background: #111;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.slides-track {
  display: flex;
  height: 100%;
  width: 100%;
}

.slides-track img {
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.3);
  backdrop-filter: blur(4px);
  border: none;
  color: white;
  font-size: 1.5em;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.slide-btn:hover { background: rgba(255,255,255,0.5); }
.prev { left: 16px; }
.next { right: 16px; }

.slide-dots {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.slide-dots button {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.5);
  cursor: pointer;
  padding: 0;
  transition: background 0.2s, transform 0.2s;
}
.slide-dots button.active {
  background: white;
  transform: scale(1.3);
}

@media (max-width: 768px) {
  .slideshow {
    height: 400px;
  }
}
</style>
