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
          {{ item }}
        </li>
      </ul>
    </div>

    <span
      v-for="i in 4"
      :key="'c' + i"
      class="aspiration-circle"
      :style="getCircleStyle(i - 1)"
    ></span>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

const blockProps = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})

const visibilityClasses = computed(() => ({
  'hide-mobile': blockProps.visibility.mobile === false,
  'hide-tablet': blockProps.visibility.tablet === false,
  'hide-desktop': blockProps.visibility.desktop === false,
}))

const sectionRef = ref(null)
const scrollProgress = ref(0)

const onScroll = () => {
  if (!sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  const vh = window.innerHeight
  const start = vh
  const end = vh * 0.2

  if (rect.top > start) { scrollProgress.value = 0; return }
  if (rect.top < end) { scrollProgress.value = 1; return }
  scrollProgress.value = 1 - ((rect.top - end) / (start - end))
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))

const titleStyle = computed(() => {
  const p = scrollProgress.value
  return {
    transform: `translateY(${80 * (1 - p)}px)`,
    opacity: p,
    transition: 'transform 0.15s ease-out, opacity 0.15s ease-out'
  }
})

const t = 'transform 0.08s linear, opacity 0.08s linear'

function getItemStyle(index) {
  const sp = scrollProgress.value
  const stagger = index * 0.22
  const effectiveP = Math.max(0, Math.min(1, (sp - stagger) / (1 - stagger)))

  const splitGap = 180 * (1 - effectiveP)
  const ty = 60 * (1 - effectiveP)
  const items = blockProps.props?.items || []

  return {
    transform: `translateY(${ty}px)`,
    opacity: Math.min(1, effectiveP * 6),
    marginBottom: index < items.length - 1 ? `${splitGap}px` : '0',
    transition: t
  }
}

function getCircleStyle(index) {
  const sp = scrollProgress.value
  const stagger = index * 0.22 + 0.06
  const effectiveP = Math.max(0, Math.min(1, (sp - stagger) / (1 - stagger)))

  const ty = 120 * (1 - effectiveP)
  const circleOpacity = (0.7 - index * 0.15) * Math.min(1, effectiveP * 6)
  const leftPos = 20 + index * 25

  return {
    left: `${leftPos}%`,
    transform: `translateY(${ty}px)`,
    opacity: circleOpacity,
    transition: t
  }
}
</script>

<style scoped>
.block-aspirations {
  container-type: inline-size;
  padding: 70px 24px;
  overflow: hidden;
  position: relative;
}

.aspirations-inner {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 40px;
  position: relative;
  z-index: 1;
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
  gap: 0;
  width: 100%;
}

.aspiration-item {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.4;
  padding-left: 50px;
  will-change: transform, opacity, margin;
}

.aspiration-circle {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #1A96DF;
  pointer-events: none;
  bottom: 20px;
  will-change: transform, opacity;
}

@container (max-width: 768px) {
  .aspirations-inner { align-items: center; text-align: center; }
  .aspirations-title { font-size: clamp(40px, 8vw, 75px); }
  .aspiration-item {
    font-size: clamp(20px, 5vw, 36px);
    padding-left: 0;
  }
  .aspiration-circle { display: none; }
}

@container (max-width: 600px) {
  .block-aspirations { padding: 50px 20px; }
}
</style>