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
        <!-- Cercles : TOUS montent vers Y=0 (ligne horizontale commune) -->
        <span
          v-for="(item, i) in blockProps.props.items"
          :key="'circle-' + i"
          class="aspiration-circle"
          :class="{ 'is-active': isItemActive(i) }"
          :style="getCircleStyle(i)"
        ></span>

        <!-- Lignes de texte : chacune à sa position de liste -->
        <div
          v-for="(item, i) in blockProps.props.items"
          :key="'line-' + i"
          class="aspiration-line"
          :class="{ 'is-active': isItemActive(i) }"
          :style="getLineStyle(i)"
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

const lineHeight = 87 // Hauteur d'une ligne de texte
const circleTop = 0 // Y commun final pour TOUS les cercles (première ligne)
const circleSize = 24
const circleLeftOffset = -80 // Décalage horizontal à gauche

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
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))

const count = computed(() => (blockProps.props.items || []).length)

// Number of items that should be considered active based on discrete steps.
// This makes activation cumulative and stepwise: as scrollProgress increases
// the activeCount rises by integer steps so items activate one-by-one.
const activeCount = computed(() => {
  if (isMobile.value) return count.value
  const sp = scrollProgress.value
  // map progress [0,1] to [0,count]
  const n = Math.floor(sp * count.value + 0.000001)
  return Math.max(0, Math.min(count.value, n))
})

const lineActive = 0.02 // 2% du segment pour l'animation active

function getTitleStyle() {
  if (isMobile.value) return { opacity: 1 }
  const sp = scrollProgress.value
  // Prevent flashing: once fully shown, keep shown
  if (sp <= 0 && !titleShown.value) return { opacity: 0 }
  if (sp >= 0.02) {
    titleShown.value = true
    return { opacity: 1 }
  }
  // if title already shown, keep it visible
  if (titleShown.value) return { opacity: 1 }
  return { opacity: sp / 0.02 }
}

function getLineStyle(index) {
  if (isMobile.value) return { transform: 'translateY(0)', opacity: 1 }

  const sp = scrollProgress.value
  // On déplace la logique d'animation vers le CSS. Ici on renvoie un
  // style vide pour desktop et gère l'affichage immédiat sur mobile.
  if (isMobile.value) return { transform: 'translateY(0)', opacity: 1 }
  return {}
}

// Style du texte : synchronisé pour apparaître quand son cercle commence à monter
function getTextStyle(index) {
  if (isMobile.value) return { opacity: 1, transform: 'translateY(0)' }

  const sp = scrollProgress.value
  const lineTotal = 1 / count.value
  // Add a small threshold so the first item isn't active immediately when
  // scrollProgress is 0. This prevents the first circle/text from becoming
  // active before the section is actually in view.
  const startP = index * lineTotal + lineActive

  // Avant le début : caché et mis au même niveau vertical que le cercle (début)
  const startTop = index * lineHeight + 100
  const lineTop = index * lineHeight
  // limit the text offset so it doesn't appear extremely low; keep it subtle
  const textOffset = Math.min(startTop - lineTop, 20) // décalage vertical initial du texte
  if (sp < startP) return { transform: `translateY(${textOffset}px)`, opacity: 0 }

  // On laisse CSS piloter la transformation finale. Ici on prépare:
  // - une position initiale basse pour le texte (alignée sur le cercle)
  // - quand l'item devient actif, on ne met PAS transform/opacity inline afin que
  //   les règles CSS (.aspiration-line.is-active .aspiration-text) prennent effet.
  // On synchronise le démarrage du texte avec le cercle (même delay), mais on
  // donne une durée plus courte au texte pour qu'il s'arrête à sa ligne avant le cercle.
   const itemTiming = getTimingFor(index) || DEFAULT
   const c = (itemTiming && itemTiming.circle) || DEFAULT.circle
   const t = (itemTiming && itemTiming.text) || DEFAULT.text
   const textDuration = Math.min(0.32, Number(t.duration) || 0.38)
   const active = isItemActive(index)
   // when deactivating we want a reversed stagger so items animate back in
   // reverse order; compute a small reverse delay based on the index
   const reverseStep = 0.06
   const reverseDelay = (count.value - 1 - index) * reverseStep
   return {
     transitionDelay: `${active ? c.delay : reverseDelay}s`,
     transitionTimingFunction: t.timing,
     transitionDuration: `${textDuration}s`,
   }
}

function getCircleStyle(index) {
  // Cette fonction renvoie la position initiale du cercle (autour de sa ligne).
  // L'animation vers la position finale (top: 0) se fait via CSS lorsque
  // la classe "is-active" est ajoutée.
  if (isMobile.value) return {
    opacity: 1,
    top: circleTop + 'px',
    left: (index * 30 + circleLeftOffset) + 'px',
    width: circleSize + 'px',
    height: circleSize + 'px',
  }

  const startTop = index * lineHeight + 100
  const itemTiming = getTimingFor(index) || DEFAULT
  const c = (itemTiming && itemTiming.circle) || DEFAULT.circle
  const active = isItemActive(index)
  // For reverse animation compute a reversed stagger so when scrolling up
  // the circles move down in reversed order.
  const reverseStep = 0.06
  const reverseDelay = (count.value - 1 - index) * reverseStep
  // When active, move circles to a shared top (circleTop) and arrange
  // them horizontally left-to-right so they form a row; inactive ones stay
  // at their line position. leftActivePosition spaces activated circles.
  const leftActivePosition = (activatedIndex) => (activatedIndex * (circleSize + 8) + circleLeftOffset)
  const activatedIndex = active ? index : null
  const left = active ? leftActivePosition(index) : (index * 30 + circleLeftOffset)

  return {
    opacity: active ? 1 : 0,
    top: active ? circleTop + 'px' : startTop + 'px',
    left: left + 'px',
    width: circleSize + 'px',
    height: circleSize + 'px',
    transitionProperty: 'top, left, opacity',
    transitionDuration: `${c.duration}s, ${c.duration}s, ${c.opacityDuration || c.duration}s`,
    transitionTimingFunction: `${c.timing}, ${c.timing}, ${c.opacityTiming || 'ease-out'}`,
    transitionDelay: `${active ? c.delay : reverseDelay}s`,
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
  transition: opacity 320ms ease-out;
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
  /* tighten durations and keep a smooth easing curve */
  transition: top 420ms cubic-bezier(.22,.9,.3,1), left 420ms cubic-bezier(.22,.9,.3,1), opacity 320ms ease-out;
}

.aspiration-text {
  margin-left: 25px;
  display: inline-block; /* allow transform on the text when animating */
}

/* When an item becomes active we move its circle to the shared top (0) and reveal the text */
.aspiration-circle.is-active {
  top: 0 !important;
  opacity: 1 !important;
}

.aspiration-line .aspiration-text {
  transform: translateY(20px);
  opacity: 0;
  transition: transform 380ms cubic-bezier(.22,.9,.3,1), opacity 380ms ease-out;
}

.aspiration-line.is-active .aspiration-text {
  transform: translateY(0);
  opacity: 1;
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
