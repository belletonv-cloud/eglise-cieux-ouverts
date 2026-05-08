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
          <span class="aspiration-text">{{ item }}</span>
        </li>
      </ul>
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

const t = 'transform 0.08s linear, opacity 0.08s linear'

function getItemStyle(index) {
  const sp = scrollProgress.value
  const stagger = index * 0.22
  const effectiveP = Math.max(0, Math.min(1, (sp - stagger) / (1 - stagger)))

  const splitGap = 160 * (1 - effectiveP)
  const ty = 60 * (1 - effectiveP)
  const items = blockProps.props?.items || []

  return {
    transform: `translateY(${ty}px)`,
    opacity: Math.min(1, effectiveP * 6),
    paddingLeft: '50px',
    marginBottom: index < items.length - 1 ? `${splitGap}px` : '0',
    transition: t
  }
}

function getBulletStyle(index) {
  const sp = scrollProgress.value
  const stagger = index * 0.22 + 0.06
  const effectiveP = Math.max(0, Math.min(1, (sp - stagger) / (1 - stagger)))

  const tx = index * 50 * (1 - effectiveP)
  const ty = 80 * (1 - effectiveP)
  const circleOpacity = (0.8 - index * 0.16) * Math.min(1, effectiveP * 6)

  return {
    transform: `translate(${tx}px, ${ty}px)`,
    opacity: circleOpacity,
    left: '0',
    backgroundColor: '#1A96DF',
    border: 'none',
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
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 50px;
  will-change: transform, opacity, margin;
}

.aspiration-text {
  will-change: transform, opacity;
}

.aspiration-bullet {
  position: absolute;
  left: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  will-change: transform, opacity;
}

@container (max-width: 768px) {
  .aspirations-inner { align-items: center; text-align: center; }
  .aspirations-title { font-size: clamp(40px, 8vw, 75px); }
  .aspiration-item {
    font-size: clamp(20px, 5vw, 36px);
    padding-left: 0;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
  }
  .aspiration-bullet { display: none; }
}

@container (max-width: 600px) {
  .block-aspirations { padding: 50px 20px; }
}
</style>
