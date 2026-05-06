<template>
  <section
    class="block-bienvenue"
    :class="visibilityClasses"
    ref="sectionRef"
  >
    <img src="https://static.wixstatic.com/media/d65230_c609095100164117aabdd3b55d9cdf56~mv2.png/v1/fill/w_1920,h_515,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/d65230_c609095100164117aabdd3b55d9cdf56~mv2.png" alt="Foule Croix" class="bienvenue-img" />
    
    <div class="bienvenue-content">
      <div class="hero-bienvenue-wrapper" aria-label="BIENVENUE">
        <div class="hero-bienvenue-line line-1" :style="line1Style">B I E&nbsp;</div>
        <div class="hero-bienvenue-line line-2" :style="line2Style">N V E&nbsp;</div>
        <div class="hero-bienvenue-line line-3" :style="line3Style">N U E</div>
      </div>
      <p class="hero-subtitle" :style="subtitleStyle">à l'Église Cieux Ouverts à Morlaix</p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, inject, onMounted, onUnmounted } from 'vue'

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
const scrollProgress = ref(isEditor ? 1 : 0)

const onScroll = () => {
  if (isEditor || !sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  const vh = window.innerHeight
  const start = vh
  const end = vh * 0.3
  
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

// Color is always #054886
const color = '#054886'

const line1Style = computed(() => {
  const p = scrollProgress.value
  const tx = -300 * (1 - p)
  const rot = -45 * (1 - p)
  return {
    color,
    transform: `translateX(${tx}px) rotate(${rot}deg)`,
    opacity: p === 0 ? 0 : 0.2 + (p * 0.8),
    transition: 'transform 0.1s linear, opacity 0.1s linear'
  }
})

const line2Style = computed(() => {
  const p = scrollProgress.value
  const ty = 150 * (1 - p)
  const rot = 15 * (1 - p)
  return {
    color,
    transform: `translateY(${ty}px) rotate(${rot}deg)`,
    opacity: p === 0 ? 0 : 0.2 + (p * 0.8),
    transition: 'transform 0.1s linear, opacity 0.1s linear'
  }
})

const line3Style = computed(() => {
  const p = scrollProgress.value
  const tx = 300 * (1 - p)
  const rot = 45 * (1 - p)
  return {
    color,
    transform: `translateX(${tx}px) rotate(${rot}deg)`,
    opacity: p === 0 ? 0 : 0.2 + (p * 0.8),
    transition: 'transform 0.1s linear, opacity 0.1s linear'
  }
})

const subtitleStyle = computed(() => {
  const p = scrollProgress.value
  return {
    transform: `translateY(${(1-p)*50}px)`,
    opacity: p,
    transition: 'transform 0.1s linear, opacity 0.1s linear'
  }
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
}

.hero-bienvenue-line {
  white-space: pre;
  letter-spacing: 0.1em;
  will-change: transform, opacity;
  transform-origin: center center;
}

.hero-subtitle {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 17.5px;
  color: rgb(67, 139, 176);
  font-weight: 400;
  margin-top: 20px;
  will-change: transform, opacity;
}

@container (max-width: 768px) {
  .hero-bienvenue-wrapper {
    font-size: clamp(30px, 8vw, 50px);
    flex-wrap: wrap;
    justify-content: center;
    line-height: 1.1;
  }
  .hero-subtitle {
    font-size: 16px;
    margin-top: 15px;
  }
}
</style>
