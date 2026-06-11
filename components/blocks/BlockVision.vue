<template>
  <section
    class="vision-section"
    :style="{ background: backgroundGradient, color: textColor }"
    :class="[visibilityClasses, { 'is-triggered': isTriggered || isEditor }]"
    ref="sectionRef"
  >
    <div class="vision-content" :style="contentStyle">
      <p class="vision-label" v-if="label">{{ label }}</p>
      <p class="vision-quote" v-if="quote" v-html="formattedQuote"></p>
      <NuxtLink v-if="ctaText && ctaLink" :to="ctaLink" class="btn btn-white">{{ ctaText }}</NuxtLink>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, inject } from 'vue'
const {
  backgroundGradient = '',
  textColor = '#222',
  label = '',
  quote = '',
  ctaText = '',
  ctaLink = '',
  visibility = {},
  isTriggered = false,
} = defineProps({
  backgroundGradient: { type: String, default: '' },
  textColor: { type: String, default: '#222' },
  label: { type: String, default: '' },
  quote: { type: String, default: '' },
  ctaText: { type: String, default: '' },
  ctaLink: { type: String, default: '' },
  visibility: { type: Object, default: () => ({}) },
  isTriggered: { type: Boolean, default: false },
})

const isEditor = inject('isEditor', false)

const visibilityClasses = computed(() => ({
  'hide-mobile': visibility.mobile === false,
  'hide-tablet': visibility.tablet === false,
  'hide-desktop': visibility.desktop === false,
}))

const formattedQuote = computed(() => {
  if (!quote) return ''
  let text = quote.replace(/\\n|\n/g, '<br>')
  text = text.replace(/gloire/g, '<strong>gloire</strong>')
  text = text.replace(/royaume/g, '<strong>royaume</strong>')
  text = text.replace(/volonté/g, '<strong>volonté</strong>')
  return text
})

const sectionRef = ref(null)
const scrollProgress = ref(import.meta.client ? 0 : 1)

const onScroll = () => {
  if (!sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  const vh = window.innerHeight
  const start = vh
  const end = vh * 0.15

  if (rect.top > start) { scrollProgress.value = 0; return }
  if (rect.top < end) { scrollProgress.value = 1; return }
  scrollProgress.value = 1 - (rect.top - end) / (start - end)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

const contentStyle = computed(() => ({
  transform: `scale(${0.85 + scrollProgress.value * 0.15})`
}))
</script>

<style scoped>
.vision-section {
  container-type: inline-size;
  padding: 70px 24px;
  text-align: center;
}
.vision-content {
  transform-origin: center center;
  transition: transform 0.1s ease-out;
}
.vision-label {
  font-size: 1.4em;
  font-weight: 600;
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  margin-bottom: 20px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
  transition-delay: 0.1s;
}
.vision-quote {
  font-size: clamp(1.4em, 3.5vw, 2.2em);
  font-weight: 300;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto 36px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
  transition-delay: 0.3s;
}
.vision-section.is-triggered .vision-label,
.vision-section.is-triggered .vision-quote {
  opacity: 1;
  transform: translateY(0);
}
.vision-quote :deep(strong) {
  font-style: italic;
  font-weight: 600;
  font-family: 'Playfair Display', Georgia, serif;
}
.btn-white {
  display: inline-block;
  background: white;
  color: #064886;
  padding: 14px 32px;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.2s;
  transition-delay: 0.5s;
}
.vision-section.is-triggered .btn-white {
  opacity: 1;
  transform: translateY(0);
}
.btn-white:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
@container (max-width: 600px) {
  .vision-section { padding: 50px 20px; }
}
</style>
