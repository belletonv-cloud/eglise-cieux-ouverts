<template>
  <section
    class="block-rejoins"
    :style="{ background: props.backgroundGradient || '#064886' }"
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
        <div v-for="(h, i) in props.horaires" :key="i" class="rejoins-horaire" :style="getHoraireStyle(i)">
          <span class="horaire-time">{{ h.heure }}</span>
          <span class="horaire-label">{{ h.label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const p = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})

const sectionRef = ref(null)
const scrollProgress = ref(0) // 0 to 1

const visibilityClasses = computed(() => ({
  'hide-mobile': p.visibility.mobile === false,
  'hide-tablet': p.visibility.tablet === false,
  'hide-desktop': p.visibility.desktop === false,
}))

const onScroll = () => {
  if (!sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  const vh = window.innerHeight
  const start = vh
  const end = vh * 0.4
  
  if (rect.top > start) {
    scrollProgress.value = 0
  } else if (rect.top < end) {
    scrollProgress.value = 1
  } else {
    scrollProgress.value = 1 - ((rect.top - end) / (start - end))
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const rejoinsTextStyle = computed(() => {
  const p = scrollProgress.value
  // starts at right (+300px), goes to left (0px)
  const tx = 300 * (1 - p)
  return { 
    transform: `translateX(${tx}px)`, 
    opacity: 0.2 + (p * 0.8),
    transition: 'transform 0.1s linear, opacity 0.1s linear' 
  }
})

const rejoinsGridStyle = computed(() => {
  const p = scrollProgress.value
  return {
    opacity: p,
    transition: 'opacity 0.1s linear'
  }
})

function getHoraireStyle(index) {
  const p = scrollProgress.value
  // Delay the animation of each horaire
  const delay = index * 0.2
  const progress = Math.max(0, Math.min(1, (p - delay) / (1 - delay)))
  const ty = 100 * (1 - progress)
  return {
    transform: `translateY(${ty}px)`,
    opacity: progress,
    transition: 'transform 0.1s linear, opacity 0.1s linear'
  }
}
</script>

<style scoped>
.block-rejoins {
  container-type: inline-size;
  padding: 100px 24px;
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
  will-change: transform, opacity;
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
  will-change: opacity;
  align-items: flex-start;
}

.rejoins-horaire {
  display: flex;
  flex-direction: column;
  gap: 0px;
  will-change: transform, opacity;
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

@container (max-width: 900px) {
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
