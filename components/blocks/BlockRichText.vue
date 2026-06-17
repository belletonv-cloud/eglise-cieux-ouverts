<template>
  <section
    class="block-richtext"
    :style="{
      background: backgroundGradient || backgroundColor,
      color: textColor,
      paddingTop: padding + 'px',
      paddingBottom: padding + 'px',
      textAlign: textAlign,
    }"
    :class="[visibilityClasses, animClass]"
    ref="sectionRef"
  >
    <div class="richtext-inner" v-html="sanitizedContent"></div>
  </section>
</template>

<script setup>
import { sanitizeHtml } from '~/utils/sanitize.js'
const {
  backgroundGradient = '',
  backgroundColor = '#ffffff',
  textColor = '#000',
  padding = 32,
  textAlign = 'left',
  content = '',
  animation = 'none',
  visibility = {},
  isTriggered = false,
} = defineProps({
  backgroundGradient: { type: String, default: '' },
  backgroundColor: { type: String, default: '#ffffff' },
  textColor: { type: String, default: '#000' },
  padding: { type: Number, default: 32 },
  textAlign: { type: String, default: 'left' },
  content: { type: String, default: '' },
  animation: { type: String, default: 'none' },
  visibility: { type: Object, default: () => ({}) },
  isTriggered: { type: Boolean, default: false },
})
const sectionRef = ref(null)
const triggered = ref(false)
const isEditor = inject('isEditor', false)
const sanitizedContent = computed(() => content ? sanitizeHtml(content) : '')

const animClass = computed(() => {
  if (!animation || animation === 'none') return ''
  return `block-anim-${animation} ${triggered.value ? 'triggered' : ''}`
})

const visibilityClasses = computed(() => ({
  'hide-mobile': visibility.mobile === false,
  'hide-tablet': visibility.tablet === false,
  'hide-desktop': visibility.desktop === false,
}))

onMounted(() => {
  if (isTriggered || isEditor) {
    triggered.value = true
    return
  }
  const observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) { triggered.value = true; observer.disconnect() } },
    { threshold: 0.1 }
  )
  if (sectionRef.value) observer.observe(sectionRef.value)
})
</script>

<style scoped>
.block-richtext { max-width: 100%; }
.richtext-inner { max-width: 900px; margin: 0 auto; line-height: 1.7; font-size: 1.05em; }

@media (max-width: 768px) {
  .richtext-inner { padding: 0 16px; }
}
</style>
