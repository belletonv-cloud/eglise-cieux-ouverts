<template>
  <section
    class="block-bienvenue"
    :class="visibilityClasses"
    ref="sectionRef"
  >
    <img src="https://static.wixstatic.com/media/d65230_c609095100164117aabdd3b55d9cdf56~mv2.png/v1/fill/w_1920,h_515,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/d65230_c609095100164117aabdd3b55d9cdf56~mv2.png" alt="Foule Croix" class="bienvenue-img" />
    
    <div class="bienvenue-content">
      <div class="hero-bienvenue-portal" aria-label="BIENVENUE">
        <span v-for="(char, i) in wordArr" :key="i" class="hero-bienvenue-char" :style="getPortalLetterStyle(i)">{{ char }}</span>
      </div>
      <p class="hero-subtitle" :style="subtitleStyle">à l'Église Cieux Ouverts à Morlaix</p>
      <!-- All content is static for now. If dynamic text is desired, add explicit props for title/subtitle/fb/insta links here. -->
      <div class="hero-socials" :style="socialsStyle">
        <a href="https://www.instagram.com/eglise_cieux_ouverts/" target="_blank" rel="noopener" aria-label="Instagram Cieux Ouverts" class="social-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        </a>
        <a href="https://www.facebook.com/eglisecieuxouverts" target="_blank" rel="noopener" aria-label="Facebook Cieux Ouverts" class="social-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  visibility: { type: Object, default: () => ({}) },
  isTriggered: { type: Boolean, default: false },
})

const visibilityClasses = computed(() => ({
  'hide-mobile': props.visibility.mobile === false,
  'hide-tablet': props.visibility.tablet === false,
  'hide-desktop': props.visibility.desktop === false,
}))

const sectionRef = ref(null)
const scrollProgress = ref(0)
const isEditor = inject('isEditor', false)

const onScroll = () => {
  if (!sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  const vh = window.innerHeight

  const start = vh
  const end = 76

  if (rect.top > start) { scrollProgress.value = 0; return }
  if (rect.top < end) { scrollProgress.value = 1; return }
  scrollProgress.value = 1 - ((rect.top - end) / (start - end))
}

let isEditorMode = false

onMounted(() => {
  if (p.isTriggered || isEditor) {
    scrollProgress.value = 1
    isEditorMode = true
    return
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  if (!isEditorMode) window.removeEventListener('scroll', onScroll)
})

const t = 'transform 0.08s linear, opacity 0.1s linear'

const wordArr = ['B','I','E','N','V','E','N','U','E']

/**
 * Styles "portail" pour chaque lettre, regroupement parfait à la fin
 */
function getPortalLetterStyle(i) {
  const p = scrollProgress.value
  const wordLength = wordArr.length
  const center = (wordLength - 1) / 2

  // Espacement horizontal (éventail fermé > ouvert)
  const maxSpread = 120
  const offsetX = (i - center) * maxSpread * (1 - p)

  // Décalage vertical pour éventail haut
  const amplitude = 95
  let offsetY = -amplitude * Math.abs(i - center) * (1 - p)
  if (i === 0 || i === wordLength - 1) offsetY *= 1.14 // encore plus haut sur les extrêmes

  // Option fanfare : un poil de rotation
  const maxRot = 24
  const rot = (i - center) * maxRot * (1 - p)

  // Petit effet scale à l'arrivée
  // Scale très petit au début, comme une émergence
  const minScale = 0.04
  const scale = minScale + (1 - minScale) * p

  return {
    display: 'inline-block',
    color: '#054886',
    opacity: Math.max(0, Math.min(1, (p - 0.18) * 1.5)), // apparition plus tardive
    transform: `translateX(${offsetX}px) translateY(${offsetY}px) rotate(${rot}deg) scale(${scale})`,
    transition: 'transform 0.44s cubic-bezier(.23,1.29,.48,.99),opacity 0.21s linear',
    willChange: 'transform, opacity',
    pointerEvents: 'none',
  }
}


const subtitleStyle = computed(() => {
  const p = scrollProgress.value
  return {
    transform: `translateY(${50 * (1 - p)}px)`,
    opacity: p,
    transition: t,
    color: '#054886'
  }
})

const socialsStyle = computed(() => {
  const p = scrollProgress.value
  return {
    transform: `translateY(${30 * (1 - p)}px)`,
    opacity: p,
    transition: t,
    pointerEvents: p > 0.5 ? 'auto' : 'none',
  }
})
</script>

<style scoped>
.block-bienvenue {
  position: relative;
  overflow: hidden;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 600px;
}

.bienvenue-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  z-index: 0;
}

.bienvenue-content {
  position: relative;
  z-index: 1;
  text-align: center;
  width: 100%;
  max-width: 1200px;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-bienvenue-portal {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Playfair Display', serif;
  font-size: 80px;
  line-height: 1.3;
  margin-bottom: 20px;
  position: relative;
  width: 100%;
  white-space: nowrap;
  user-select: none;
}
.hero-bienvenue-char {
  display: inline-block;
  will-change: transform, opacity;
  margin: 0 0.03em;
}

.hero-subtitle {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 17.5px;
  font-weight: 400;
  margin-top: 20px;
  will-change: transform, opacity;
}

.hero-socials {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(5, 72, 134, 0.85);
  color: white;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s;
}

.social-icon:hover {
  background: #054886;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .hero-bienvenue-wrapper {
    font-size: clamp(24px, 6vw, 50px);
    flex-wrap: nowrap;
    justify-content: center;
    line-height: 1.1;
    white-space: nowrap;
  }
  .hero-subtitle { font-size: 16px; margin-top: 15px; }
  .hero-socials { margin-top: 16px; }
  .block-bienvenue { min-height: 400px; }
}
@container (max-width: 768px) {
  .hero-bienvenue-wrapper {
    font-size: clamp(24px, 6vw, 50px);
    flex-wrap: nowrap;
    justify-content: center;
    line-height: 1.1;
    white-space: nowrap;
  }
  .hero-subtitle { font-size: 16px; margin-top: 15px; }
  .hero-socials { margin-top: 16px; }
  .block-bienvenue { min-height: 400px; }
}

@media (max-width: 480px) {
  .block-bienvenue { min-height: 320px; }
  .hero-subtitle { font-size: 14px; }
}
@container (max-width: 480px) {
  .block-bienvenue { min-height: 320px; }
  .hero-subtitle { font-size: 14px; }
}
</style>