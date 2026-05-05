<template>
  <section
    class="block-aspirations"
    :style="{ background: props.backgroundColor, color: props.textColor }"
    :class="visibilityClasses"
    ref="sectionRef"
  >
    <div class="aspirations-inner">
      <h2 class="aspirations-title" :style="titleStyle">{{ props.title }}</h2>
      <ul class="aspirations-list">
        <li 
          v-for="(item, i) in props.items" 
          :key="i" 
          class="aspiration-item" 
          :style="getItemStyle(i)"
        >
          <span class="aspiration-bullet" :style="getBulletStyle(i)"></span>
          {{ item }}
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

const p = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})

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
  const end = vh * 0.2
  
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

const titleStyle = computed(() => {
  const p = scrollProgress.value
  return {
    color: p.props?.textColor || '#ffffff',
    transform: `translateY(${100 * (1 - p)}px)`,
    opacity: p,
    transition: 'transform 0.1s linear, opacity 0.1s linear'
  }
})

function getItemStyle(index) {
  const p = scrollProgress.value
  const delay = index * 0.15
  const progress = Math.max(0, Math.min(1, (p - delay) / (1 - delay)))
  // Starts from 400px below and moves to 0
  const ty = 400 * (1 - progress)
  return {
    color: p.props?.textColor || '#ffffff',
    transform: `translateY(${ty}px)`,
    opacity: progress,
    transition: 'transform 0.1s linear, opacity 0.1s linear'
  }
}

function getBulletStyle(index) {
  const p = scrollProgress.value
  const delay = index * 0.15
  const progress = Math.max(0, Math.min(1, (p - delay) / (1 - delay)))
  const scale = progress
  return {
    transform: `scale(${scale})`,
    opacity: progress,
    transition: 'transform 0.1s linear, opacity 0.1s linear'
  }
}
</script>

<style scoped>
.block-aspirations {
  padding: 100px 24px;
  overflow: hidden;
}

.aspirations-inner {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 40px;
}

.aspirations-title {
  font-family: 'Playfair Display', serif;
  font-size: 75px;
  font-weight: 400;
  line-height: 1.3;
  margin: 0;
  will-change: transform, opacity;
}

.aspirations-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
}

.aspiration-item {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.4;
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 50px;
  will-change: transform, opacity;
}

.aspiration-bullet {
  position: absolute;
  left: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  will-change: transform, opacity;
}

@media (max-width: 768px) {
  .aspirations-inner {
    align-items: center;
    text-align: center;
  }
  .aspirations-title {
    font-size: clamp(40px, 8vw, 75px);
  }
  .aspiration-item {
    font-size: clamp(20px, 5vw, 36px);
    padding-left: 0;
    justify-content: center;
    transform: none !important; /* disable horizontal shift on mobile if needed */
  }
  .aspiration-bullet {
    display: none;
  }
}
</style>
