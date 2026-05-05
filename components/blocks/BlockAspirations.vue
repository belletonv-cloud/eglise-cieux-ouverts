<template>
  <section
    class="block-aspirations"
    :style="{ background: props.backgroundColor, color: props.textColor }"
    :class="visibilityClasses"
  >
    <div class="aspirations-inner">
      <h2 class="aspirations-title" :style="{ color: props.textColor }">{{ props.title }}</h2>
      <ul class="aspirations-list">
        <li v-for="(item, i) in props.items" :key="i" :style="{ color: props.textColor }">
          {{ item }}
        </li>
      </ul>
      <div class="anime-inner" ref="animeRef">
        <p class="anime-label" :style="{ color: props.textColor + 'bb' }">{{ props.quoteLabel }}</p>
        <p class="anime-quote" :style="[{ color: props.textColor }, animeQuoteStyle]">
          <template v-for="(line, i) in quoteLines" :key="i">
            {{ line }}<br v-if="i < quoteLines.length - 1" />
          </template>
        </p>
        <a :href="props.ctaLink" class="btn-outline-white">{{ props.ctaText }}</a>
      </div>
    </div>
  </section>
</template>

<script setup>
const p = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})

const animeRef = ref(null)
const animeProgress = ref(0)

const quoteLines = computed(() => (p.props.quote || '').split('\n'))

const animeQuoteStyle = computed(() => {
  const scale = 0.88 + animeProgress.value * 0.12
  return { transform: `scale(${scale})`, transition: 'transform 0.1s linear' }
})

const visibilityClasses = computed(() => ({
  'hide-mobile': p.visibility.mobile === false,
  'hide-tablet': p.visibility.tablet === false,
  'hide-desktop': p.visibility.desktop === false,
}))

onMounted(() => {
  const onScroll = () => {
    if (!animeRef.value) return
    const rect = animeRef.value.getBoundingClientRect()
    const vh = window.innerHeight
    animeProgress.value = Math.max(0, Math.min(1, (vh - rect.top) / (vh * 0.7)))
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
</script>

<style scoped>
.block-aspirations {
  padding: 80px 20px;
}
.aspirations-inner {
  max-width: 1100px;
  margin: 0 auto;
}
.aspirations-title {
  font-family: Georgia, serif;
  font-size: clamp(2em, 5vw, 3em);
  font-style: italic;
  margin-bottom: 40px;
}
.aspirations-list {
  list-style: none;
  display: flex;
  flex-direction: column;
}
.aspirations-list li {
  font-size: 1.1em;
  padding: 22px 0 22px 36px;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  position: relative;
  line-height: 1.5;
}
.aspirations-list li:first-child { border-top: 1px solid rgba(255,255,255,0.15); }
.aspirations-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  border: 2px solid rgba(255,255,255,0.6);
}
.anime-inner {
  max-width: 720px;
  margin: 60px auto 0;
  text-align: center;
  overflow: hidden;
}
.anime-label {
  font-family: Georgia, serif;
  font-size: 0.85em;
  font-weight: 700;
  letter-spacing: 0.15em;
  margin-bottom: 20px;
}
.anime-quote {
  font-family: Georgia, serif;
  font-size: clamp(1.2em, 3vw, 1.9em);
  font-style: italic;
  line-height: 1.65;
  margin: 0 auto 40px;
  will-change: transform;
  transform-origin: center center;
}
.btn-outline-white {
  display: inline-block;
  padding: 13px 36px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1em;
  text-decoration: none;
  background: transparent;
  color: white;
  border: 2px solid white;
  transition: background 0.2s, transform 0.2s;
}
.btn-outline-white:hover {
  background: rgba(255,255,255,0.15);
  transform: translateY(-2px);
  text-decoration: none;
}
</style>
