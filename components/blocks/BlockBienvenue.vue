<template>
  <section
    class="block-bienvenue"
    :class="[visibilityClasses, { 'is-visible': isVisible }]"
    ref="sectionRef"
  >
    <img src="https://static.wixstatic.com/media/d65230_c609095100164117aabdd3b55d9cdf56~mv2.png/v1/fill/w_1920,h_515,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/d65230_c609095100164117aabdd3b55d9cdf56~mv2.png" alt="Foule Croix" class="bienvenue-img" />
    
    <div class="bienvenue-content">
      <div class="hero-bienvenue-wrapper" aria-label="BIENVENUE">
        <div class="hero-bienvenue-line line-1">B I E&nbsp;</div>
        <div class="hero-bienvenue-line line-2">N V E&nbsp;</div>
        <div class="hero-bienvenue-line line-3">N U E</div>
      </div>
      <p class="hero-subtitle">à l'Église Cieux Ouverts à Morlaix</p>
      <div class="hero-socials">
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
import { ref, inject, onMounted, onUnmounted, computed } from 'vue'

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
    isVisible.value = true
    return
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      isVisible.value = entry.isIntersecting
    },
    { threshold: 0.3 }
  )

  const el = sectionRef.value
  requestAnimationFrame(() => {
    if (el) observer.observe(el)
  })

  onUnmounted(() => observer.disconnect())
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

.hero-bienvenue-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  font-family: 'Playfair Display', serif;
  font-size: 80px;
  line-height: 1.3;
  margin-bottom: 20px;
  position: relative;
  width: 100%;
  white-space: nowrap;
}

.hero-bienvenue-line {
  white-space: pre;
  letter-spacing: 0.1em;
  will-change: transform, opacity;
  transform-origin: center center;
  opacity: 0;
  color: #054886;
}

.line-1 {
  transform: translateX(-400px) rotate(-55deg);
  transition-property: transform, opacity;
  transition-duration: 0.9s, 0.9s;
  transition-timing-function: cubic-bezier(0.16,1,0.3,1), ease;
  transition-delay: 0s, 0s;
}
.line-2 {
  transform: translateY(200px) rotate(20deg);
  transition-property: transform, opacity;
  transition-duration: 0.9s, 0.9s;
  transition-timing-function: cubic-bezier(0.16,1,0.3,1), ease;
  transition-delay: 0.15s, 0.15s;
}
.line-3 {
  transform: translateX(400px) rotate(55deg);
  transition-property: transform, opacity;
  transition-duration: 0.9s, 0.9s;
  transition-timing-function: cubic-bezier(0.16,1,0.3,1), ease;
  transition-delay: 0.3s, 0.3s;
}

.is-visible .line-1,
.is-visible .line-2,
.is-visible .line-3 {
  opacity: 1;
  transform: none;
  transition-duration: 0.9s, 0.3s;
  transition-delay: 0s, 0s;
}

.hero-subtitle {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 17.5px;
  color: #054886;
  font-weight: 400;
  margin-top: 20px;
  will-change: transform, opacity;
  opacity: 0;
  transform: translateY(50px);
  transition-property: transform, opacity;
  transition-duration: 0.8s, 0.8s;
  transition-timing-function: cubic-bezier(0.16,1,0.3,1), ease;
  transition-delay: 0.4s, 0.4s;
}

.is-visible .hero-subtitle {
  opacity: 1;
  transform: none;
  transition-duration: 0.8s, 0.3s;
  transition-delay: 0s, 0s;
}

.hero-socials {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  will-change: transform, opacity;
  opacity: 0;
  transform: translateY(30px);
  transition-property: transform, opacity;
  transition-duration: 0.8s, 0.8s;
  transition-timing-function: cubic-bezier(0.16,1,0.3,1), ease;
  transition-delay: 0.5s, 0.5s;
}

.is-visible .hero-socials {
  opacity: 1;
  transform: none;
  transition-duration: 0.8s, 0.3s;
  transition-delay: 0s, 0s;
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
}
</style>