<template>
  <section
    class="block-aspirations"
    :style="{ background: blockProps.props.backgroundColor, color: blockProps.props.textColor }"
    :class="visibilityClasses"
    ref="sectionRef"
  >
    <div class="aspirations-inner">
      <h2 class="aspirations-title" :style="getTitleStyle()">{{ blockProps.props.title }}</h2>
      <div class="aspirations-list" ref="listRef">
        <div
          v-for="(item, i) in blockProps.props.items"
          :key="i"
          class="aspiration-line"
          :style="getLineStyle(i)"
        >
          <span class="aspiration-circle" :style="getCircleStyle(i)"></span>
          <span class="aspiration-text">{{ item }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

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
const listRef = ref(null)
const scrollProgress = ref(0)
const isMobile = ref(false)

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
  isMobile.value = window.innerWidth < 768
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))

const count = computed(() => (blockProps.props.items || []).length)

const circleTop = '20px'
const circleSpacing = 28

function getTitleStyle() {
  if (isMobile.value) return { opacity: 1 }
  const sp = scrollProgress.value
  const totalPerLine = 1 / count.value
  const active = totalPerLine * 0.3
  if (sp <= 0) return { opacity: 0 }
  if (sp >= active) return { opacity: 1 }
  return { opacity: sp / active }
}

function getLineStyle(index) {
  if (isMobile.value) return { transform: 'translateY(0)', opacity: 1 }

  const sp = scrollProgress.value
  const n = count.value
  const totalPerLine = 1 / n
  const active = totalPerLine * 0.2
  const startP = index * totalPerLine
  const endP = startP + active

  if (sp <= startP) return { transform: 'translateY(100px)', opacity: 0 }
  if (sp >= endP) return { transform: 'translateY(0)', opacity: 1 }

  const localP = (sp - startP) / active
  const ty = 100 * (1 - localP)
  return {
    transform: `translateY(${ty}px)`,
    opacity: localP,
  }
}

function getCircleStyle(index) {
  if (isMobile.value) return { opacity: 1, top: circleTop, left: (index * circleSpacing) + 'px' }

  const sp = scrollProgress.value
  const n = count.value
  const totalPerLine = 1 / n
  const active = totalPerLine * 0.2
  const startP = index * totalPerLine
  const endP = startP + active

  if (sp <= startP) return { opacity: 0, top: circleTop, left: (index * circleSpacing) + 'px' }
  if (sp >= endP) return { opacity: 1, top: circleTop, left: (index * circleSpacing) + 'px' }

  const localP = (sp - startP) / active
  return { opacity: localP, top: circleTop, left: (index * circleSpacing) + 'px' }
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
  border-bottom: 1px solid rgba(255,255,255,0.2);
  font-family: Helvetica, Arial, sans-serif;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.4;
  will-change: transform, opacity;
}

.aspiration-line:last-child {
  border-bottom: none;
}

.aspiration-circle {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(26, 150, 223, 0.55);
  will-change: opacity;
}

.aspiration-text {
  margin-left: 55px;
  will-change: opacity;
}

@container (max-width: 768px) {
  .aspirations-inner { align-items: center; text-align: center; }
  .aspirations-title { font-size: clamp(32px, 8vw, 60px); }
  .aspiration-line {
    font-size: clamp(16px, 4.5vw, 28px);
    padding: 14px 0;
  }
  .aspiration-circle {
    width: 14px;
    height: 14px;
  }
  .aspiration-text {
    margin-left: 40px;
  }
}

@container (max-width: 600px) {
  .block-aspirations { padding: 50px 20px; }
}
</style>
