<template>
  <section
    class="vision-section"
    :style="{ background: props.backgroundGradient }"
    :class="animationClass"
    ref="sectionRef"
  >
    <p class="vision-label">{{ props.label }}</p>
    <p class="vision-quote" v-html="formattedQuote"></p>
    <a :href="props.ctaLink" class="btn btn-white">{{ props.ctaText }}</a>
  </section>
</template>

<script setup>
import { useIntersectionObserver } from '~/composables/useIntersectionObserver.js'

const props = defineProps({
  props: Object,
  visibility: Object,
})

const formattedQuote = computed(() => props.props.quote.replace(/\\n/g, '<br>'))

const sectionRef = ref(null)
const animationClass = ref('')

onMounted(() => {
  useIntersectionObserver(sectionRef, {
    onIntersect: () => {
      animationClass.value = 'visible'
    },
    unobserve: true,
    threshold: 0.2
  })
})
</script>

<style scoped>
.vision-section {
  padding: 80px 24px;
  text-align: center;
  color: white;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.vision-section.visible {
  opacity: 1;
  transform: translateY(0);
}
.vision-label {
  font-size: 0.9em;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.8;
  margin-bottom: 20px;
}
.vision-quote {
  font-size: clamp(1.2em, 3vw, 1.8em);
  font-weight: 300;
  font-style: italic;
  line-height: 1.6;
  max-width: 700px;
  margin: 0 auto 36px;
}
</style>
