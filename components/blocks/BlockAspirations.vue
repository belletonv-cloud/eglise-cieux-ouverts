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
        <!-- Cercles positionnés par rapport au conteneur, pas aux lignes -->
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
          :ref="el => setLineRef(el, i)"
        >
          <span class="aspiration-text">{{ item }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'

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

// Positions des lignes de texte (mesurées au montage)
const lineTops = ref([])
const lineRefs = ref([])
const circleTop = 20 // Y commun pour tous les cercles (en px)
const circleLeft = -10 // Décalage horizontal à gauche (plus à gauche)

function setLineRef(el, i) {
  if (el) lineRefs.value[i] = el
}

const onScroll = () => {
  if (!sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  const vh = window.innerHeight
  const start = vh * 5
  const end = 0

  if (rect.top > start) { scrollProgress.value = 0; return }
  if (rect.top < end) { scrollProgress.value = 1; return }
  scrollProgress.value = 1 - ((rect.top - end) / (start - end))
}

onMounted(async () => {
  isMobile.value = window.innerWidth < 768
  window.addEventListener('scroll', onScroll, { passive: true })
  
  await nextTick()
  
  // Mesurer la position Y de chaque ligne de texte par rapport au conteneur
  if (listRef.value && lineRefs.value.length) {
    const listRect = listRef.value.getBoundingClientRect()
    lineTops.value = lineRefs.value.map(line => {
      if (!line) return 0
      const lineRect = line.getBoundingClientRect()
      return lineRect.top - listRect.top
    })
  }
  
  onScroll()
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))

const count = computed(() => (blockProps.props.items || []).length)

// Chaque ligne utilise 1/N du scroll, avec une TRÈS longue pause
const lineActive = 0.02 // Seulement 2% du segment pour l'animation, 98% de pause

function getTitleStyle() {
  if (isMobile.value) return { opacity: 1 }
  const sp = scrollProgress.value
  if (sp <= 0) return { opacity: 0 }
  if (sp >= 0.06) return { opacity: 1 }
  return { opacity: sp / 0.06 }
}

function getLineStyle(index) {
  if (isMobile.value) return { transform: 'translateY(0)', opacity: 1 }

  const sp = scrollProgress.value
  const lineTotal = 1 / count.value // Chaque ligne = 1/N du scroll total
  const startP = index * lineTotal
  const activeEnd = startP + (lineTotal * lineActive) // Fin de l'animation active

  if (sp <= startP) return { transform: 'translateY(100px)', opacity: 0 }
  if (sp >= activeEnd) return { transform: 'translateY(0)', opacity: 1 }

  const localP = (sp - startP) / (lineTotal * lineActive)
  const ty = 100 * (1 - localP)
  return {
    transform: `translateY(${ty}px)`,
    opacity: localP,
  }
}

function getCircleStyle(index) {
  if (isMobile.value) return { 
    opacity: 1, 
    top: circleTop + 'px', 
    left: circleLeft + 'px' 
  }

  const sp = scrollProgress.value
  const lineTotal = 1 / count.value
  const startP = index * lineTotal
  
  // Position Y de départ du cercle (à côté de sa ligne de texte + 100px)
  const lineTop = lineTops.value[index] || (index * 60)
  const startTop = lineTop + 100
  
  // Le cercle commence à monter avec le texte, et continue après que le texte s'est arrêté
  // Il finit à circleTop (Y commun) à la FIN du scroll (sp = 1.0)
  if (sp <= startP) return { 
    opacity: 0,
    top: startTop + 'px', 
    left: circleLeft + 'px' 
  }
  
  // Le cercle a commencé à monter. Il doit atteindre circleTop à la fin du scroll (sp = 1)
  // Progression : de startP à 1.0
  const circleProgress = Math.min(1, (sp - startP) / (1 - startP))
  const currentTop = startTop + (circleTop - startTop) * circleProgress
  
  return { 
    opacity: Math.min(1, circleProgress * 6),
    top: currentTop + 'px', 
    left: circleLeft + 'px' 
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
  padding-left: 15px;
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
  will-change: top, opacity;
}

.aspiration-text {
  margin-left: 15px;
  will-change: opacity;
}

@container (max-width: 768px) {
  .aspirations-inner { align-items: center; text-align: center; }
  .aspirations-title { font-size: clamp(32px, 8vw, 60px); }
  .aspiration-line {
    font-size: clamp(16px, 4.5vw, 28px);
    padding: 14px 0;
    padding-left: 10px;
  }
  .aspiration-circle {
    width: 14px;
    height: 14px;
  }
  .aspiration-text {
    margin-left: 10px;
  }
}

@container (max-width: 600px) {
  .block-aspirations { padding: 50px 20px; }
}
</style>
