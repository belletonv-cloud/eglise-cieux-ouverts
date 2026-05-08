<template>
  <section
    class="block-aspirations"
    :style="{ background: props.backgroundColor, color: props.textColor }"
    :class="visibilityClasses"
    ref="sectionRef"
  >
    <div class="aspirations-inner">
      <h2 class="aspirations-title" :style="titleStyle">{{ props.title }}</h2>
      <div class="aspirations-list">
        <div
          v-for="(item, i) in props.items"
          :key="i"
          class="aspiration-line"
        >
          <span class="aspiration-circle" :style="getCircleStyle(i)"></span>
          <span class="aspiration-text" :style="getTextStyle(i)">{{ item }}</span>
        </div>
      </div>
    </div>
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

function lineProgress(sp, index) {
  const startP = index * 0.2
  const endP = (index + 1) * 0.2
  if (sp <= startP) return 0
  if (sp >= endP) return 1
  return (sp - startP) / 0.2
}

const t = 'transform 0.05s linear, opacity 0.05s linear'

function getCircleStyle(index) {
  const sp = scrollProgress.value
  const localP = lineProgress(sp, index)
  const easeP = 1 - Math.pow(1 - localP, 1.5)

  const tx = (index * 15) * (1 - easeP)
  const ty = 100 * (1 - easeP)

  return {
    transform: `translate(${tx}px, ${ty}px)`,
    opacity: Math.min(0.55, easeP * 3),
    transition: t
  }
}

function getTextStyle(index) {
  const sp = scrollProgress.value
  const localP = lineProgress(sp, index + 0.02)
  const ty = 100 * (1 - localP)

  return {
    transform: `translateY(${ty}px)`,
    opacity: Math.min(1, localP * 5),
    transition: t
  }
}
</script>

<style scoped>
.block-aspirations {
  container-type: inline-size;
  padding: 70px 24px;
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
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
}

.aspiration-line {
  display: grid;
  grid-template-columns: 55px 1fr;
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  font-family: Helvetica, Arial, sans-serif;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.4;
  position: relative;
}

.aspiration-line:last-child {
  border-bottom: none;
}

.aspiration-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(26, 150, 223, 0.55);
  justify-self: flex-start;
  will-change: transform, opacity;
}

.aspiration-text {
  will-change: transform, opacity;
}

@container (max-width: 768px) {
  .aspirations-inner { align-items: center; text-align: center; }
  .aspirations-title { font-size: clamp(32px, 8vw, 60px); }
  .aspiration-line {
    grid-template-columns: 40px 1fr;
    font-size: clamp(16px, 4.5vw, 28px);
    padding: 14px 0;
  }
  .aspiration-circle {
    width: 14px;
    height: 14px;
  }
}

@container (max-width: 600px) {
  .block-aspirations { padding: 50px 20px; }
}
</style>
