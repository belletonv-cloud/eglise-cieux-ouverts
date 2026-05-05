<template>
  <section
    class="vision-section"
    :style="{ background: props.backgroundGradient, color: props.textColor }"
    :class="visibilityClasses"
  >
    <p class="vision-label" v-if="props.label">{{ props.label }}</p>
    <p class="vision-quote" v-if="props.quote" v-html="formattedQuote"></p>
    <NuxtLink v-if="props.ctaText && props.ctaLink" :to="props.ctaLink" class="btn btn-white">{{ props.ctaText }}</NuxtLink>
  </section>
</template>

<script setup>
const p = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})

const visibilityClasses = computed(() => ({
  'hide-mobile': p.visibility.mobile === false,
  'hide-tablet': p.visibility.tablet === false,
  'hide-desktop': p.visibility.desktop === false,
}))

const formattedQuote = computed(() => {
  if (!p.props.quote) return ''
  // Bold words gloire, royaume, volonté
  let text = p.props.quote.replace(/\n/g, '<br>')
  text = text.replace(/gloire/g, '<strong>gloire</strong>')
  text = text.replace(/royaume/g, '<strong>royaume</strong>')
  text = text.replace(/volonté/g, '<strong>volonté</strong>')
  return text
})
</script>

<style scoped>
.vision-section {
  padding: 100px 24px;
  text-align: center;
}

.vision-label {
  font-size: 1.4em;
  font-weight: 600;
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  margin-bottom: 20px;
}

.vision-quote {
  font-size: clamp(1.4em, 3.5vw, 2.2em);
  font-weight: 300;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto 36px;
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
}
.btn-white:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
</style>
