<template>
  <section
    class="block-nous-rejoindre"
    :style="{ background: props.backgroundGradient }"
    :class="[visibilityClasses]"
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
const scrollProgress = ref(0)

const onScroll = () => {
  if (!sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  const vh = window.innerHeight
  const start = vh
  const end = vh * 0.15

  if (rect.top > start) { scrollProgress.value = 0; return }
  if (rect.top < end) { scrollProgress.value = 1; return }
  scrollProgress.value = 1 - (rect.top - end) / (start - end)
}

onMounted(() => {
  if (isEditor) {
    scrollProgress.value = 1
    return
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

const circleLeftStyle = computed(() => {
  const p = scrollProgress.value
  return {
    transform: `translateX(${-220 + 200 * p}px) scale(${0.8 + 0.2 * p})`,
    opacity: p,
  }
})

const circleRightStyle = computed(() => {
  const p = scrollProgress.value
  return {
    transform: `translateX(${220 - 200 * p}px) scale(${0.8 + 0.2 * p})`,
    opacity: p * 0.6,
  }
})

const circleSmallStyle = computed(() => {
  const p = scrollProgress.value
  return {
    transform: `translateY(${80 - 80 * p}px) scale(${0.6 + 0.4 * p})`,
    opacity: p,
  }
})

const contentStyle = computed(() => {
  const p = scrollProgress.value
  return {
    transform: `scale(${0.9 + 0.1 * p})`,
    opacity: p,
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
  left: 10%; top: 50%; margin-top: -200px;
}

.circle-right {
  width: 600px; height: 600px;
  background: rgba(255,255,255,0.08);
  right: -5%; top: 50%; margin-top: -300px;
}

.circle-small {
  width: 80px; height: 80px;
  background: rgba(255,255,255,0.9);
  bottom: 20%; left: 30%;
}

.content {
  position: relative;
  z-index: 1;
  will-change: transform, opacity;
}

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
