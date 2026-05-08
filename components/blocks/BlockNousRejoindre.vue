<template>
  <section
    class="block-nous-rejoindre"
    :style="{ background: props.backgroundGradient }"
    :class="[visibilityClasses]"
    ref="sectionRef"
  >
    <div class="circle circle-left" :style="circleLeftStyle"></div>
    <div class="circle circle-right" :style="circleRightStyle"></div>
    <div class="circle circle-small" :style="circleSmallStyle"></div>

    <NuxtLink :to="props.link || '/contact'" class="cta-link" :style="textStyle">
      {{ props.title }}
    </NuxtLink>
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
const scrollProgress = ref(0)

const onScroll = () => {
  if (!sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  const vh = window.innerHeight
  const start = vh
  const end = vh * 0.3

  if (rect.top > start) { scrollProgress.value = 0; return }
  if (rect.top < end) { scrollProgress.value = 1; return }
  scrollProgress.value = 1 - ((rect.top - end) / (start - end))
}

onMounted(() => {
  if (isEditor) {
    scrollProgress.value = 1
    return
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))

const ct = 'transform 0.4s cubic-bezier(.22,.9,.35,1)'

const circleLeftStyle = computed(() => {
  const p = scrollProgress.value
  return {
    left: '50%',
    top: '50%',
    transform: `translate(calc(-50% + ${-350 * (1 - p)}px), calc(-50% + ${-150 * (1 - p)}px)) scale(${0.6 + 0.6 * p})`,
    opacity: Math.min(1, p * 1.5),
    transition: ct
  }
})

const circleRightStyle = computed(() => {
  const p = scrollProgress.value
  return {
    left: '50%',
    top: '50%',
    transform: `translate(calc(-50% + ${400 * (1 - p)}px), calc(-50% + ${80 * (1 - p)}px)) scale(${0.7 + 0.4 * p})`,
    opacity: Math.min(0.9, p * 0.9 + 0.1),
    transition: ct
  }
})

const circleSmallStyle = computed(() => {
  const p = scrollProgress.value
  return {
    left: '50%',
    top: '50%',
    transform: `translate(calc(-50% + ${-100 * (1 - p)}px), calc(-50% + ${200 * (1 - p)}px)) scale(${0.4 + 0.7 * p})`,
    opacity: p,
    transition: ct
  }
})

const textStyle = computed(() => {
  const p = scrollProgress.value
  const scale = 0.25 + 0.75 * p
  return {
    transform: `scale(${scale})`,
    opacity: Math.min(1, p * 1.3),
    transition: 'transform 0.2s ease-out, opacity 0.2s ease-out'
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
}

.circle-left {
  width: 400px; height: 400px;
  background: rgba(255,255,255,0.15);
}

.circle-right {
  width: 600px; height: 600px;
  background: rgba(255,255,255,0.08);
}

.circle-small {
  width: 80px; height: 80px;
  background: rgba(255,255,255,0.9);
}

.cta-link {
  position: relative;
  z-index: 1;
  color: white;
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: clamp(2em, 5vw, 4em);
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  line-height: 1.1;
  will-change: transform, opacity;
}

@container (max-width: 600px) {
  .block-nous-rejoindre { padding: 50px 20px; min-height: 300px; }
}
</style>