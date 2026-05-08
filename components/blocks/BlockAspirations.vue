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
        <!-- Cercles positionnés par rapport au conteneur -->
        <span
          v-for="(item, i) in blockProps.props.items"
          :key="'circle-' + i"
          class="aspiration-circle"
          :style="getCircleStyle(i)"
        ></span>

        <!-- Lignes de texte uniquement -->
        <div
          v-for="(item, i) in blockProps.props.items"
          :key="'line-' + i"
          class="aspiration-line"
          :style="getLineStyle(i)"
        >
          <span class="aspiration-text">{{ item }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

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
const isMobile = ref(false)

const lineHeight = 87 // Hauteur approximative d'une ligne
const circleTop = 20 // Y commun final pour tous les cercles
const circleSize = 24 // Plus gros
const circleSpacing = 30 // Décalage horizontal entre cercles

const onScroll = () => {
  if (!sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  const vh = window.innerHeight
  const start = vh * 3
  const end = 0

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

// Chaque ligne = 1/N du scroll, animation sur 2% du segment
const lineActive = 0.02

function getTitleStyle() {
  if (isMobile.value) return { opacity: 1 }
  const sp = scrollProgress.value
  if (sp <= 0) return { opacity: 0 }
  if (sp >= 0.02) return { opacity: 1 }
  return { opacity: sp / 0.02 }
}

function getLineStyle(index) {
  if (isMobile.value) return { transform: 'translateY(0)', opacity: 1 }

  const sp = scrollProgress.value
  const lineTotal = 1 / count.value
  const startP = index * lineTotal
  const activeEnd = startP + (lineTotal * lineActive)

  // Lignes précédentes : visibles à leur place
  if (sp >= activeEnd && index < getCurrentIndex(sp)) {
    return { transform: 'translateY(0)', opacity: 1 }
  }

  // Ligne en cours d'animation
  if (sp >= startP && sp < activeEnd) {
    const localP = (sp - startP) / (lineTotal * lineActive)
    const ty = 100 * (1 - localP)
    return {
      transform: `translateY(${ty}px)`,
      opacity: Math.min(1, localP * 6),
    }
  }

  // Futur : caché
  return { transform: 'translateY(100px)', opacity: 0 }
}

function getCurrentIndex(sp) {
  const lineTotal = 1 / count.value
  return Math.min(Math.floor(sp / lineTotal), count.value - 1)
}

function getCircleStyle(index) {
  if (isMobile.value) return { 
    opacity: 1, 
    top: circleTop + 'px', 
    left: (index * circleSpacing) + 'px',
    width: circleSize + 'px',
    height: circleSize + 'px',
  }

  const sp = scrollProgress.value
  const lineTotal = 1 / count.value
  const startP = index * lineTotal

  // Position Y de départ : à côté de sa ligne de texte + 100px
  const startTop = index * lineHeight + 100

  // Cercle précédent : visible à sa place finale
  if (sp >= startP && index < getCurrentIndex(sp)) {
    return { 
      opacity: 1, 
      top: circleTop + 'px', 
      left: (index * circleSpacing) + 'px',
      width: circleSize + 'px',
      height: circleSize + 'px',
    }
  }

  // Cercle en cours d'animation : de startTop vers circleTop
  if (sp >= startP) {
    const circleProgress = Math.min(1, (sp - startP) / (1 - startP))
    const currentTop = startTop + (circleTop - startTop) * circleProgress
    return { 
      opacity: Math.min(1, circleProgress * 6),
      top: currentTop + 'px', 
      left: (index * circleSpacing) + 'px',
      width: circleSize + 'px',
      height: circleSize + 'px',
    }
  }

  // Futur : caché
  return { 
    opacity: 0, 
    top: startTop + 'px', 
    left: (index * circleSpacing) + 'px',
    width: circleSize + 'px',
    height: circleSize + 'px',
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
  padding-left: 20px;
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
  border-radius: 50%;
  background: rgba(26, 150, 223, 0.55);
}

.aspiration-text {
  margin-left: 20px;
}

@container (max-width: 768px) {
  .aspirations-inner { align-items: center; text-align: center; }
  .aspirations-title { font-size: clamp(32px, 8vw, 60px); }
  .aspiration-line {
    font-size: clamp(16px, 4.5vw, 28px);
    padding: 14px 0;
    padding-left: 15px;
  }
  .aspiration-circle {
    width: 18px;
    height: 18px;
  }
  .aspiration-text {
    margin-left: 15px;
  }
}

@container (max-width: 600px) {
  .block-aspirations { padding: 50px 20px; }
}
</style>
