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
    { threshold: 0.15 }
  )

  if (sectionRef.value) observer.observe(sectionRef.value)

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
  line-height:1.3;
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
}

.line-1 {
  transform: translateX(-300px) rotate(-45deg);
  transition: transform 0.6s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease;
}
.line-2 {
  transform: translateY(150px) rotate(15deg);
  transition: transform 0.6s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease;
  transition-delay: 0.1s;
}
.line-3 {
  transform: translateX(300px) rotate(45deg);
  transition: transform 0.6s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease;
  transition-delay: 0.2s;
}

.is-visible .line-1,
.is-visible .line-2,
.is-visible .line-3 {
  opacity: 1;
  transform: none;
}

.hero-subtitle {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 17.5px;
  color: rgb(67, 139, 176);
  font-weight: 400;
  margin-top: 20px;
  will-change: transform, opacity;
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1);
  transition-delay: 0.3s;
}

.is-visible .hero-subtitle {
  opacity: 1;
  transform: none;
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
}
</style>
