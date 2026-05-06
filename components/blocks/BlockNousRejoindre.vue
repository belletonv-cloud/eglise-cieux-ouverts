<template>
  <section
    class="block-nous-rejoindre"
    :style="{ background: props.backgroundGradient }"
    :class="[visibilityClasses, { 'is-visible': isVisible }]"
    ref="sectionRef"
  >
    <!-- Background Circles Parallax -->
    <div class="circle circle-left" :style="circleLeftStyle"></div>
    <div class="circle circle-right" :style="circleRightStyle"></div>
    <div class="circle circle-small" :style="circleSmallStyle"></div>

    <div class="content" :style="contentStyle">
      <NuxtLink :to="props.link || '/contact'" class="cta-cercle">
        <span class="cta-text">{{ props.title }}</span>
      </NuxtLink>
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
const isVisible = ref(isEditor)
const scrollProgress = ref(0)

function onScroll() {
  if (!sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  const vh = window.innerHeight
  const start = vh
  const end = vh * 0.3
  if (rect.top > start) scrollProgress.value = 0
  else if (rect.top < end) scrollProgress.value = 1
  else scrollProgress.value = 1 - ((rect.top - end) / (start - end))
}

onMounted(() => {
  if (isEditor) {
    isVisible.value = true
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) isVisible.value = true
    },
    { threshold: 0.12 }
  )
  if (sectionRef.value) observer.observe(sectionRef.value)

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  onUnmounted(() => {
    observer.disconnect()
    window.removeEventListener('scroll', onScroll)
  })
})

// Left circle (medium, transparent white)
const circleLeftStyle = computed(() => {
  const pVal = scrollProgress.value
  const txPct = -200 * (1 - pVal)
  const scale = 0.8 + 0.4 * pVal
  return {
    transform: `translateX(${txPct}%) scale(${scale})`,
    opacity: Math.min(1, pVal * 1.1),
    transition: 'transform 0.45s cubic-bezier(.22,.9,.35,1)'
  }
})

// Right circle (large, more transparent)
const circleRightStyle = computed(() => {
  const pVal = scrollProgress.value
  const txPct = 200 * (1 - pVal)
  const scale = 0.9 + 0.3 * pVal
  return {
    transform: `translateX(${txPct}%) scale(${scale})`,
    opacity: Math.min(0.9, pVal * 0.9),
    transition: 'transform 0.45s cubic-bezier(.22,.9,.35,1)'
  }
})

// Small circle (solid white, from bottom or top)
const circleSmallStyle = computed(() => {
  const pVal = scrollProgress.value
  const ty = 120 * (1 - pVal)
  const scale = 0.6 + 0.5 * pVal
  return {
    transform: `translateY(${ty}px) scale(${scale})`,
    opacity: pVal,
    transition: 'transform 0.45s cubic-bezier(.22,.9,.35,1)'
  }
})

const contentStyle = computed(() => {
  const pVal = scrollProgress.value
  return {
    transform: `scale(${0.8 + (pVal * 0.2)})`,
    opacity: pVal,
    transition: 'transform 0.2s ease, opacity 0.2s ease'
  }
})
</script>

<style scoped>
.block-nous-rejoindre {
  container-type: inline-size;
  padding: 80px 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  min-height: 380px;
}

.circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  will-change: transform, opacity;
  opacity: 0;
}

.circle-left {
  width: 400px; height: 400px;
  background: rgba(255,255,255,0.15);
  left: 10%; top: 50%; margin-top: -200px;
  transform: translateX(-80px);
  transition: transform 0.8s cubic-bezier(0.4,0,0.2,1);
}

.circle-right {
  width: 600px; height: 600px;
  background: rgba(255,255,255,0.08);
  right: -5%; top: 50%; margin-top: -300px;
  transform: translateX(80px);
  transition: transform 0.9s cubic-bezier(0.4,0,0.2,1);
}

.circle-small {
  width: 80px; height: 80px;
  background: rgba(255,255,255,0.9);
  bottom: 20%; left: 30%;
  transform: translateY(50px);
  transition: transform 0.7s cubic-bezier(0.4,0,0.2,1);
}

.content {
  position: relative;
  z-index: 1;
  will-change: transform, opacity;
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.34,1.2,0.64,1);
}

/* Triggered */
.is-visible .circle,
.is-visible .content {
  opacity: 1;
  transform: none;
}
.is-visible .circle-right { opacity: 0.6; }

.cta-cercle { /* kept unchanged */
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(200px, 30vw, 300px);
  height: clamp(200px, 30vw, 300px);
  border-radius: 50%;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), background-color 0.4s;
  cursor: pointer;
  position: relative;
}

.cta-cercle::before { content: ""; position: absolute; top: 10px; right: 10px; bottom: 10px; left: 10px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3); transition: transform 0.4s; }
.cta-cercle:hover { transform: scale(1.05); background-color: rgba(255,255,255,0.1); border-color: white; }
.cta-cercle:hover::before { transform: scale(0.9); border-color: rgba(255,255,255,0.8); }

.cta-text { color: white; font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-size: clamp(2em, 4vw, 3.5em); font-weight: 700; text-align: center; line-height: 1.1; padding: 20px; }

@container (max-width: 600px) {
  .block-nous-rejoindre { padding: 50px 20px; min-height: 300px; }
}

</style>
