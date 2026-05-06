<template>
  <section
    class="block-richtext"
    :style="{
      background: props.backgroundColor,
      color: props.textColor,
      paddingTop: props.padding + 'px',
      paddingBottom: props.padding + 'px',
      textAlign: props.textAlign
    }"
    :class="[visibilityClasses, animClass]"
    ref="sectionRef"
  >
    <div class="richtext-inner" v-html="props.content"></div>
  </section>
</template>

<script setup>
const p = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})
const sectionRef = ref(null)
const triggered = ref(false)

const animClass = computed(() => {
  if (!p.props.animation || p.props.animation === 'none') return ''
  return `block-anim-${p.props.animation} ${triggered.value ? 'triggered' : ''}`
})

const visibilityClasses = computed(() => ({
  'hide-mobile': p.visibility.mobile === false,
  'hide-tablet': p.visibility.tablet === false,
  'hide-desktop': p.visibility.desktop === false,
}))

onMounted(() => {
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
</style>
