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
    </div>
  </section>
</template>

<script setup>
import { computed, ref, inject, onMounted } from 'vue'

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
</script>

<style scoped>
.block-bienvenue {
  container-type: inline-size;
  position: relative;
  overflow: hidden;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 450px;
}

.bienvenue-img {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
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
  width: 100%;
}

.hero-bienvenue-line {
  white-space: pre;
  letter-spacing: 0.1em;
  color: #054886;
  will-change: transform, opacity;
  transform-origin: center center;
  opacity: 0;
}

.line-1 { transform: translateX(-200px) rotate(-20deg); transition: opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1); transition-delay: 0s; }
.line-2 { transform: translateY(120px) rotate(10deg);   transition: opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1); transition-delay: 0.12s; }
.line-3 { transform: translateX(200px) rotate(20deg);  transition: opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1); transition-delay: 0.24s; }

.hero-subtitle {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 17.5px;
  color: rgb(67, 139, 176);
  font-weight: 400;
  margin-top: 20px;
  will-change: transform, opacity;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
  transition-delay: 0.45s;
}

/* Triggered state */
.is-visible .hero-bienvenue-line,
.is-visible .hero-subtitle {
  opacity: 1;
  transform: none;
}

@container (max-width: 768px) {
  .hero-bienvenue-wrapper {
    font-size: clamp(30px, 8vw, 50px);
    flex-wrap: wrap;
    justify-content: center;
    line-height: 1.1;
  }
  .hero-subtitle { font-size: 16px; margin-top: 15px; }
}

@container (max-width: 600px) {
  .block-bienvenue { min-height: 400px; }
  .bienvenue-content { padding: 0 20px; }
}
</style>
