<template>
  <section
    class="block-aspirations"
    :style="{ background: blockProps.props.backgroundColor, color: blockProps.props.textColor }"
    :class="[visibilityClasses, { 'js-mounted': mounted }]"
    ref="sectionRef"
  >
    <div class="aspirations-inner">
      <h2 class="aspirations-title">{{ blockProps.props.title }}</h2>
      <div class="aspirations-list" ref="listRef">
        <!-- Cercles : mouvement DIRECTEMENT piloté par le scroll (pas de transitions CSS) -->
        <span
          v-for="(item, i) in blockProps.props.items"
          :key="'circle-' + i"
          class="aspiration-circle"
          :class="{ 'is-active': isItemActive(i) }"
          :style="getCircleStyle(i)"
        ></span>

        <!-- Lignes de texte : chacune à sa position de liste, fade-in avec transitions CSS -->
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
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
// Import local per-item timings (derived from extraction) to match original site
// Try to import timings from test-results during local dev; in production the file
// is served from /aspirations-timings.json under public/. If the build tool can't
// resolve the dev path, fall back to fetching at runtime (see getTimingFor).
let timings = null

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
const titleShown = ref(false)
const mounted = ref(false)

const lineHeight = 87 // Hauteur d'une ligne de texte
const circleTop = 0 // Y commun final pour TOUS les cercles (première ligne)
const circleSize = 24
const circleLeftOffset = -80 // Décalage horizontal à gauche

// Calcul de la position Y d'un cercle directement à partir de scrollProgress
// (mouvement piloté par le scroll, pas de transitions CSS)
function getCircleY(index) {
  const sp = scrollProgress.value
  const n = count.value
  const lineTotal = 1 / Math.max(1, n)
  
  // Segment de scrollProgress pour cet item
  // (même logique que activeCount pour la cohérence)
  const startP = index * lineTotal + lineActive
  const endP = (index + 1) * lineTotal
  
  // Position de départ et d'arrivée
  const startY = index * lineHeight + 100
  const endY = 0
  
  // Si scroll est avant le début du segment : cercle à sa position initiale
  if (sp <= startP) {
    return startY
  }
  
  // Si scroll est après la fin du segment : cercle à sa position finale
  if (sp >= endP) {
    return endY
  }
  
  // Pendant le segment : interpolation linéaire directe
  const segmentProgress = (sp - startP) / (endP - startP)
  return startY + (endY - startY) * segmentProgress
}

// Use per-item timings when available, otherwise fall back to default constants
const DEFAULT = {
  circle: { delay: 0, duration: 0.42, timing: 'cubic-bezier(.22,.9,.3,1)', opacityDuration: 0.32, opacityTiming: 'ease-out' },
  text: { delay: 0, duration: 0.38, timing: 'cubic-bezier(.22,.9,.3,1)' }
}

function getTimingFor(index) {
  // Normalize labels for robust matching (remove diacritics, case, extra spaces)
  const normalize = (s) => {
    if (!s || typeof s !== 'string') return ''
    // decompose accents, remove combining marks, collapse whitespace, lowercase
    return s
      .normalize('NFD')
      .replace(/\p{M}/gu, '') // remove diacritic marks
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
  }

  let items = (timings && timings.items) || []
  // If timings not present at build time, we try to use any timings previously
  // loaded on the client (onMounted will attempt to import local JSON or fetch
  // the public JSON). We avoid awaiting here to keep this function sync so
  // it can be used directly during render.
  if ((!items || items.length === 0) && typeof window !== 'undefined') {
    const w = window.__aspirationsTimings
    if (w && typeof w.then !== 'function') {
      // already resolved object
      items = (w && w.items) || items
    }
    // if w is a promise or absent, onMounted will populate timings/window cache
  }
  const label = blockProps.props && blockProps.props.items && blockProps.props.items[index]
  if (label) {
    const nl = normalize(label)
    const byLabel = items.find((it) => normalize(it.label) === nl)
    if (byLabel) return byLabel
  }
  return items[index] || DEFAULT
}

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

  // Try to load local test-results JSON (only in dev where it's available).
  // We do this asynchronously and cache the result on `timings` and on
  // `window.__aspirationsTimings` so getTimingFor can read it synchronously.
  ;(async () => {
    try {
      // Attempt a runtime-import of the local JSON only when present. We use
      // new Function(...) to avoid bundlers statically resolving this path at
      // build time (the file exists only on some developer machines).
      // eslint-disable-next-line no-new-func
      const mod = await new Function('return import("../../test-results/aspirations-timings.json")')()
      timings = mod && (mod.default || mod)
      if (typeof window !== 'undefined') window.__aspirationsTimings = timings
      return
    } catch (e) {
      // ignore local import failure and try fetching public JSON
    }

    try {
      if (typeof window !== 'undefined') {
        const p = fetch('/aspirations-timings.json').then(r => r.json()).catch(() => null)
        // store promise on window so other code can await if needed
        window.__aspirationsTimings = p
        const loaded = await p
        timings = loaded || timings
        // replace promise with resolved object for sync reads
        window.__aspirationsTimings = timings
      }
    } catch (e) {
      // ignore fetch failure
    }
  })()
  // mark mounted after attempting to load timings so SSR won't flash the title
  mounted.value = true
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))

const count = computed(() => (blockProps.props.items || []).length)

// Number of items that should be considered active based on discrete steps.
// This makes activation cumulative and stepwise: as scrollProgress increases
// the activeCount rises by integer steps so items activate one-by-one.
const activeCount = computed(() => {
  if (isMobile.value) return count.value
  const sp = scrollProgress.value
  // Count how many items have reached their individual start threshold.
  const lineTotal = 1 / Math.max(1, count.value)
  let n = 0
  for (let i = 0; i < count.value; i++) {
    const startP = i * lineTotal + lineActive
    if (sp >= startP) n++
  }
  return n
})

const lineActive = 0.02 // 2% du segment pour l'animation active

// Titre : maintenant géré par CSS via la classe .js-mounted
// (pas de style inline pour éviter le flash SSR)

// Style du texte : synchronisé pour apparaître quand son cercle commence à monter
// On utilise uniquement des CSS variables pour les timings (pas de transform/opacity inline)
function getTextStyle(index) {
  // SSR : retourner un style vide pour éviter les flashs
  if (typeof window === 'undefined' || !mounted.value) return {}
  if (isMobile.value) return {}

  const itemTiming = getTimingFor(index) || DEFAULT
  const c = (itemTiming && itemTiming.circle) || DEFAULT.circle
  const t = (itemTiming && itemTiming.text) || DEFAULT.text
  const textDuration = Math.min(0.32, Number(t.duration) || 0.38)
  const active = isItemActive(index)
  // when deactivating we want a reversed stagger so items animate back in
  // reverse order; compute a small reverse delay based on the index
  const reverseStep = 0.06
  const reverseDelay = (count.value - 1 - index) * reverseStep
  // expose CSS variables for text animation timing
  return {
    '--aspir-text-delay': `${active ? c.delay : reverseDelay}s`,
    '--aspir-text-duration': `${textDuration}s`,
    '--aspir-text-timing': t.timing,
  }
}

// Style du cercle : MOUVEMENT DIRECTEMENT PILOTÉ PAR LE SCROLL
// (pas de transitions CSS, calcul direct de translateY à partir de scrollProgress)
function getCircleStyle(index) {
  // SSR : seulement left, pas de transform pour éviter flash
  if (typeof window === 'undefined' || !mounted.value) return {
    left: (index * 30 + circleLeftOffset) + 'px',
  }

  // Mobile : cercle à sa position finale (pas d'animation)
  if (isMobile.value) return {
    left: (index * 30 + circleLeftOffset) + 'px',
    transform: 'translateY(0)',
  }

  // Desktop : calcul DIRECT de la position Y à partir de scrollProgress
  // (mouvement piloté par le scroll, pas de transitions CSS)
  const currentY = getCircleY(index)
  const left = (index * 30 + circleLeftOffset)

  return {
    left: left + 'px',
    transform: `translateY(${currentY}px)`,
  }
}

function isItemActive(index) {
  if (isMobile.value) return true
  return index < activeCount.value
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
  opacity: 0;
  transition: opacity 320ms ease-out;
}

/* Titre apparaît quand le composant est monté (évite flash SSR) */
.block-aspirations.js-mounted .aspirations-title {
  opacity: 1;
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
  border-radius: 50%;
  background: rgba(26, 150, 223, 0.55);
  /* IMPORTANT : PAS de transitions CSS pour les cercles !
     Le mouvement est DIRECTEMENT piloté par le scroll via
     transform: translateY() calculé dans getCircleStyle().
     Cela évite l'effet "pop" et donne un mouvement "naturel" lié au scroll. */
  opacity: 1;
}

.aspiration-text {
  margin-left: 25px;
  display: inline-block; /* allow transform on the text when animating */
}

/* When an item becomes active we move its circle to the shared top (0) and reveal the text */


.aspiration-line .aspiration-text {
  transform: translateY(20px);
  opacity: 0;
  transition: transform var(--aspir-text-duration, 380ms) var(--aspir-text-timing, cubic-bezier(.22,.9,.3,1)), opacity var(--aspir-text-duration, 380ms) ease-out;
}

.aspiration-line.is-active .aspiration-text {
  transform: translateY(0);
  opacity: 1;
}

/* Prevent SSR inline "top" residues from flashing on desktop before JS runs.
   We keep mobile immediate (no hide). When JS mounts we add .js-mounted and
   allow the CSS-driven transforms to take over. */
.block-aspirations:not(.js-mounted) .aspiration-circle,
.block-aspirations:not(.js-mounted) .aspiration-line .aspiration-text {
  /* hide on desktop until hydrated to avoid mismatched SSR styles */
  opacity: 0 !important;
  transform: translateY(20px) !important;
}

@media (max-width: 767px) {
  .block-aspirations:not(.js-mounted) .aspiration-circle,
  .block-aspirations:not(.js-mounted) .aspiration-line .aspiration-text {
    opacity: 1 !important;
    transform: none !important;
  }
}

@container (max-width: 768px) {
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
