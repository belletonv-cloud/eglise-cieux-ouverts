<template>
  <section
    class="block-rejoins"
    :class="visibilityClasses"
    ref="sectionRef"
  >
    <div class="rejoins-inner">
      <div class="rejoins-text-container" :style="rejoinsTextStyle">
        <p class="rejoins-title">{{ props.title }}</p>
        <p class="rejoins-subtitle">{{ props.subtitle }}</p>
        <p class="rejoins-location">{{ props.location }}</p>
      </div>
      
      <div class="rejoins-grid" :style="rejoinsGridStyle">
        <div v-for="(h, i) in props.horaires" :key="i" class="rejoins-horaire">
          <span class="horaire-time">{{ h.heure }}</span>
          <span class="horaire-label">{{ h.label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

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
  // Simple parallax/fade or just translate
  const tx = Math.min(0, -10 + scrollProgress.value * 20)
  return { transform: `translateX(${tx}%)`, transition: 'transform 0.1s linear' }
})

const rejoinsGridStyle = computed(() => {
  const tx = 10 - scrollProgress.value * 10
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
  background-color: transparent; /* Assuming the gradient is from a background image or wrapper */
  color: white;
  overflow: hidden;
  position: relative;
  min-height: 600px;
}

.rejoins-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 120px;
}

.rejoins-text-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  will-change: transform;
}

.rejoins-title {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 75px;
  font-weight: 700;
  letter-spacing: -0.75px;
  line-height: 1.1;
  margin: 0;
  color: white;
}

.rejoins-subtitle, .rejoins-location {
  font-family: 'Playfair Display', serif;
  font-size: 75px;
  font-weight: 700;
  font-style: italic;
  line-height: 1.1;
  margin: 0;
  color: white;
}

.rejoins-grid {
  display: flex;
  flex-direction: column;
  gap: 50px;
  will-change: transform, opacity;
  align-items: flex-start;
}

.rejoins-horaire {
  display: flex;
  flex-direction: column;
  gap: 0px;
}

.horaire-time {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 75px;
  font-weight: 700;
  line-height: 1;
  color: white;
}

.horaire-label {
  font-family: 'Playfair Display', serif;
  font-size: 30px;
  font-weight: 700;
  font-style: normal;
  color: white;
  letter-spacing: -0.3px;
  margin-top: 5px;
}

@media (max-width: 900px) {
  .rejoins-inner {
    flex-direction: column;
    text-align: center;
    gap: 60px;
  }
  .rejoins-grid {
    align-items: center;
  }
  .rejoins-title, .rejoins-subtitle, .rejoins-location, .horaire-time {
    font-size: clamp(40px, 8vw, 75px);
  }
  .horaire-label {
    font-size: 24px;
  }
}
</style>
