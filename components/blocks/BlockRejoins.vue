<template>
  <section
    class="block-rejoins"
    :style="{ background: props.backgroundGradient }"
    :class="visibilityClasses"
    ref="sectionRef"
  >
    <div class="rejoins-inner">
      <p class="rejoins-text" :style="rejoinsTextStyle">
        <span class="rejoins-main">{{ props.title }}</span><br>
        <span class="rejoins-playfair">{{ props.subtitle }}<br>{{ props.location }}</span>
      </p>
      <div class="rejoins-grid" :style="rejoinsGridStyle">
        <div v-for="(h, i) in props.horaires" :key="i" class="rejoins-horaire">
          <strong>{{ h.heure }}</strong>
          <span>{{ h.label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const p = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})

const sectionRef = ref(null)
const scrollProgress = ref(0)

const visibilityClasses = computed(() => ({
  'hide-mobile': p.visibility.mobile === false,
  'hide-tablet': p.visibility.tablet === false,
  'hide-desktop': p.visibility.desktop === false,
}))

onMounted(() => {
  const onScroll = () => {
    if (!sectionRef.value) return
    const rect = sectionRef.value.getBoundingClientRect()
    const vh = window.innerHeight
    scrollProgress.value = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)))
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

const rejoinsTextStyle = computed(() => {
  const tx = Math.min(0, -25 + scrollProgress.value * 50)
  return { transform: `translateX(${tx}%)`, transition: 'transform 0.1s linear' }
})

const rejoinsGridStyle = computed(() => {
  const tx = 5 - scrollProgress.value * 5
  return {
    transform: `translateX(${tx}%)`,
    opacity: Math.min(1, scrollProgress.value * 2),
    transition: 'transform 0.1s linear, opacity 0.3s ease'
  }
})
</script>

<style scoped>
.block-rejoins {
  padding: 100px 24px;
  color: white;
  overflow: hidden;
}
.rejoins-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}
.rejoins-text {
  font-size: clamp(2.5em, 5vw, 4em);
  font-weight: 700;
  line-height: 1.1;
  text-shadow: 0 2px 20px rgba(0,0,0,0.15);
  margin: 0;
  will-change: transform;
}
.rejoins-main {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 700;
  font-style: italic;
  display: block;
}
.rejoins-playfair {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-weight: 400;
}
.rejoins-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
  will-change: transform, opacity;
  align-items: flex-start;
}
.rejoins-horaire {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rejoins-horaire strong {
  font-size: clamp(2.5em, 5vw, 3.5em);
  font-weight: 900;
  line-height: 1;
}
.rejoins-horaire span {
  font-size: 1.1em;
  opacity: 0.9;
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
}
@media (max-width: 768px) {
  .rejoins-inner {
    flex-direction: column;
    text-align: center;
  }
  .rejoins-grid {
    align-items: center;
  }
}
</style>
