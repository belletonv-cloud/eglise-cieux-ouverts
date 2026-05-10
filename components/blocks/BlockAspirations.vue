<template>
  <div
    class="aspirations-viewport"
    :class="visibilityClasses"
    ref="viewportRef"
  >
    <section
      class="block-aspirations"
      :style="{
        background: blockProps.props.backgroundColor,
        color: blockProps.props.textColor,
      }"
      ref="sectionRef"
    >
      <div class="aspirations-inner">
        <h2 class="aspirations-title">{{ blockProps.props.title }}</h2>
        <div class="aspirations-list" ref="listRef">
          <span
            v-for="(item, i) in blockProps.props.items"
            :key="'circle-' + i"
            class="aspiration-circle"
            :class="{ 'is-active': isItemActive(i) }"
            :style="getCircleStyle(i)"
          ></span>
          <div
            v-for="(item, i) in blockProps.props.items"
            :key="'line-' + i"
            class="aspiration-line"
            :class="{ 'is-active': isItemActive(i) }"
          >
            <span class="aspiration-text" :style="getTextStyle(i)">{{ item }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

let gsap, ScrollTrigger
if (import.meta.client) {
  const gsapModule = await import('gsap')
  const scrollTriggerModule = await import('gsap/ScrollTrigger')
  gsap = gsapModule.gsap || gsapModule.default || gsapModule
  ScrollTrigger = scrollTriggerModule.ScrollTrigger || scrollTriggerModule.default || scrollTriggerModule
  gsap.registerPlugin(ScrollTrigger)
}

const blockProps = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})

const visibilityClasses = computed(() => ({
  'hide-mobile': blockProps.visibility.mobile === false,
  'hide-tablet': blockProps.visibility.tablet === false,
  'hide-desktop': blockProps.visibility.desktop === false,
}))

const viewportRef = ref(null)
const sectionRef = ref(null)
const scrollProgress = ref(0)
const mounted = ref(false)
const isMobile = ref(false)

const lineHeight = 87
const circleLeftOffset = -80
const circleSize = 24

function getCircleY(index) {
  const sp = scrollProgress.value
  const n = count.value
  const lineTotal = 1 / Math.max(1, n)
  const startP = index * lineTotal + lineActive
  const endP = (index + 1) * lineTotal
  const startY = index * lineHeight + 100
  const endY = 0
  if (sp <= startP) return startY
  if (sp >= endP) return endY
  const segmentProgress = (sp - startP) / (endP - startP)
  return startY + (endY - startY) * segmentProgress
}

const onScroll = () => {
  if (!viewportRef.value) return
  const rect = viewportRef.value.getBoundingClientRect()
  const vh = window.innerHeight
  const start = vh
  const end = 0
  if (rect.top > start) { scrollProgress.value = 0; return }
  if (rect.top < end) { scrollProgress.value = 1; return }
  scrollProgress.value = 1 - ((rect.top - end) / (start - end))
}

onMounted(() => {
  isMobile.value = window.innerWidth < 768

  if (!isMobile.value && typeof window !== 'undefined' && gsap && ScrollTrigger && viewportRef.value) {
    gsap.to({}, {
      scrollTrigger: {
        trigger: viewportRef.value,
        start: 'top bottom',
        end: 'top top',
        scrub: 1,
        onUpdate: (self) => {
          scrollProgress.value = self.progress
        },
      },
    })
  } else {
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  }

  mounted.value = true
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

const count = computed(() => (blockProps.props.items || []).length)

const activeCount = computed(() => {
  if (isMobile.value) return count.value
  const sp = scrollProgress.value
  const lineTotal = 1 / Math.max(1, count.value)
  let n = 0
  for (let i = 0; i < count.value; i++) {
    const startP = i * lineTotal + lineActive
    if (sp >= startP) n++
  }
  return n
})

const lineActive = 0.02

function getTextStyle(index) {
  if (isMobile.value) return {}
  const active = isItemActive(index)
  const reverseStep = 0.06
  const reverseDelay = (count.value - 1 - index) * reverseStep
  return {
    '--aspir-text-delay': `${active ? 0 : reverseDelay}s`,
    '--aspir-text-duration': '0.38s',
    '--aspir-text-timing': 'cubic-bezier(.22,.9,.3,1)',
  }
}

function getCircleStyle(index) {
  if (!mounted.value) {
    return { left: (index * 30 + circleLeftOffset) + 'px' }
  }
  if (isMobile.value) {
    return { left: (index * 30 + circleLeftOffset) + 'px', transform: 'translateY(0)' }
  }
  return {
    left: (index * 30 + circleLeftOffset) + 'px',
    transform: `translateY(${getCircleY(index)}px)`,
  }
}

function isItemActive(index) {
  if (isMobile.value) return true
  return index < activeCount.value
}
</script>

<style scoped>
.aspirations-viewport {
  min-height: 500vh;
  position: relative;
}

.block-aspirations {
  container-type: inline-size;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 48px);
  max-width: 1048px;
  padding: 70px 24px;
  z-index: 10;
}

.aspirations-inner {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.aspirations-title {
  font-family: 'Playfair Display', serif;
  font-size: 75px;
  font-weight: 400;
  line-height: 1.3;
  margin: 0;
}

.aspirations-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
}

.aspiration-line {
  display: flex;
  align-items: center;
  padding: 18px 0;
  padding-left: 25px;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  font-family: Helvetica, Arial, sans-serif;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.4;
}

.aspiration-line:last-child {
  border-bottom: none;
}

.aspiration-circle {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(26, 150, 223, 0.55);
  opacity: 1;
}

.aspiration-text {
  margin-left: 25px;
  display: inline-block;
}

.aspiration-line .aspiration-text {
  transform: translateY(20px);
  opacity: 0;
  transition: transform var(--aspir-text-duration, 380ms) var(--aspir-text-timing, cubic-bezier(.22,.9,.3,1)), opacity var(--aspir-text-duration, 380ms) ease-out;
}

.aspiration-line.is-active .aspiration-text {
  transform: translateY(0);
  opacity: 1;
}

@container (max-width: 768px) {
  .aspirations-viewport { min-height: auto; }
  .block-aspirations { position: relative; left: auto; top: auto; transform: none; width: 100%; max-width: 100%; }
  .aspirations-inner { align-items: center; text-align: center; }
  .aspirations-title { font-size: clamp(32px, 8vw, 60px); }
  .aspiration-line {
    font-size: clamp(16px, 4.5vw, 28px);
    padding: 14px 0;
    padding-left: 20px;
  }
  .aspiration-circle {
    width: 18px;
    height: 18px;
  }
  .aspiration-text {
    margin-left: 20px;
  }
}

@container (max-width: 600px) {
  .block-aspirations { padding: 50px 20px; }
}
</style>
