<template>
  <div
    class="aspirations-viewport"
    :class="visibilityClasses"
    ref="viewportRef"
  >
    <div class="timeline-block">
      <div class="inner-block">
        <h2 class="titre-main">{{ blockProps.props.title }}</h2>
        <div class="cercles-flottants" ref="cerclesRef">
          <span
            v-for="(_, i) in items"
            :key="'c' + i"
            class="cercle"
            :style="getCercleStyle(i)"
          >{{ i + 1 }}</span>
        </div>
        <ul class="liste-timeline" ref="listRef">
          <li
            v-for="(item, i) in items"
            :key="'l' + i"
            :class="{ visible: isRevealed(i) }"
            :ref="el => setItemRef(el, i)"
          >
            <span class="text-col">{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

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
const listRef = ref(null)
const scrollProgress = ref(0)
const mounted = ref(false)
const isMobile = ref(false)
const itemOffsets = ref([])

const items = computed(() => blockProps.props.items || [])

const rawProgress = computed(() => {
  const p = Math.max(0, Math.min(1, scrollProgress.value))
  return p * items.value.length
})

const revealed = computed(() => Math.min(Math.floor(rawProgress.value), items.value.length))
const remainder = computed(() => {
  const r = rawProgress.value - revealed.value
  return Math.max(0, Math.min(1, r))
})

const headerY = 87

function setItemRef(el, index) {
  if (el && mounted.value && !isMobile.value) {
    itemOffsets.value[index] = el.offsetTop + 14
  }
}

function isRevealed(index) {
  if (isMobile.value) return true
  return index < revealed.value
}

function getCercleStyle(index) {
  if (isMobile.value) {
    return {
      left: (index * 32) + 'px',
      top: headerY + 'px',
      opacity: 1,
      transform: 'translateY(0)',
    }
  }

  const inlineY = itemOffsets.value[index] ?? (headerY + (index + 1) * 61)
  let currentY

  if (index < revealed.value - 1) {
    currentY = headerY
  } else if (index === revealed.value - 1) {
    const t = remainder.value
    currentY = inlineY + (headerY - inlineY) * t
  } else {
    currentY = inlineY
  }

  return {
    left: (index * 32) + 'px',
    top: currentY + 'px',
    opacity: index < revealed.value || isMobile.value ? 1 : 0,
    transition: 'none',
  }
}

const onScroll = () => {
  if (!viewportRef.value) return
  const rect = viewportRef.value.getBoundingClientRect()
  const vh = window.innerHeight
  const start = vh * 1.1
  const end = -viewportRef.value.offsetHeight + vh * 0.3
  if (rect.top > start) { scrollProgress.value = 0; return }
  if (rect.top < end) { scrollProgress.value = 1; return }
  scrollProgress.value = 1 - ((rect.top - end) / (start - end))
}

onMounted(async () => {
  isMobile.value = window.innerWidth < 768
  await nextTick()
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  mounted.value = true
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.aspirations-viewport {
  min-height: 500vh;
  position: relative;
}

.timeline-block {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  pointer-events: none;
}

.inner-block {
  pointer-events: auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 28px rgba(20, 68, 145, 0.1);
  padding: 48px 34px 56px 34px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 330px;
  max-width: 430px;
  min-height: 245px;
  position: relative;
}

.titre-main {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #226aad;
  width: 100%;
  margin: 0 0 33px 0;
  text-align: center;
  z-index: 5;
}

.cercles-flottants {
  position: absolute;
  left: 34px;
  right: 34px;
  top: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 20;
}

.cercle {
  position: absolute;
  width: 25px;
  height: 25px;
  border-radius: 40px;
  border: 3px solid #226aad;
  background: #fff;
  color: #226aad;
  font-weight: bold;
  text-align: center;
  font-size: 1.15em;
  box-shadow: 0 2px 6px rgba(0, 82, 178, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  transition: none;
  will-change: top, opacity;
}

.liste-timeline {
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  position: relative;
  min-height: 145px;
  display: flex;
  flex-direction: column;
  gap: 34px;
}

.liste-timeline li {
  display: flex;
  align-items: center;
  opacity: 0;
  transform: translateY(25px);
  transition: opacity 0.42s, transform 0.56s;
  position: relative;
  padding-left: 120px;
}

.liste-timeline li.visible {
  opacity: 1;
  transform: translateY(0);
}

.text-col {
  font-size: 1.12rem;
  color: #214b7f;
  font-weight: 400;
  line-height: 1.52;
  flex: 1;
  position: relative;
  z-index: 1;
}

@media (max-width: 544px) {
  .inner-block {
    max-width: 96vw;
    min-width: 0;
    padding: 7vw 1vw 8vw 1vw;
  }
  .liste-timeline {
    min-height: 98px;
    gap: 20px;
  }
  .liste-timeline li {
    padding-left: 60px;
  }
  .text-col {
    font-size: 1rem;
  }
  .cercle {
    width: 17px;
    height: 17px;
    font-size: 0.85em;
  }
}
</style>
