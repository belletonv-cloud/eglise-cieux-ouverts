<template>
  <section
    class="block-hero"
    :style="{ minHeight: props.height + 'px' }"
    :class="visibilityClasses"
  >
    <img v-if="props.image" :src="props.image" alt="Hero" class="hero-img" />
    <div class="hero-content">
      <div class="hero-bienvenue-wrapper" aria-label="BIENVENUE">
        <div class="hero-bienvenue-line line-1" :style="{ color: props.textColor || '#054886' }">B I E&nbsp;</div>
        <div class="hero-bienvenue-line line-2" :style="{ color: props.textColor || '#054886' }">N V E&nbsp;</div>
        <div class="hero-bienvenue-line line-3" :style="{ color: props.textColor || '#054886' }">N U E</div>
      </div>
      <p class="hero-subtitle">à l'Église Cieux Ouverts à Morlaix</p>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
const p = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})
const props = computed(() => p.props)
const visibilityClasses = computed(() => ({
  'hide-mobile': p.visibility.mobile === false,
  'hide-tablet': p.visibility.tablet === false,
  'hide-desktop': p.visibility.desktop === false,
}))
</script>

<style scoped>
.block-hero {
  position: relative;
  overflow: hidden;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  width: 100%;
  max-width: 1200px;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-bienvenue-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-family: 'Playfair Display', serif;
  font-size: 80px;
  line-height: 1.3; /* 104px */
  margin-bottom: 20px;
  position: relative;
  /* Adjusting to match the staggering */
  left: -50px;
}

.hero-bienvenue-line {
  white-space: pre;
  letter-spacing: 0.1em;
}

.line-1 {
  transform: translateX(-40px);
}
.line-2 {
  transform: translateX(20px);
}
.line-3 {
  transform: translateX(120px);
}

.hero-subtitle {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 17.5px;
  color: rgb(67, 139, 176); /* exact extracted color */
  font-weight: 400;
  margin-top: 20px;
  transform: translateX(120px);
}

@media (max-width: 768px) {
  .hero-bienvenue-wrapper {
    font-size: clamp(40px, 10vw, 60px);
    left: 0;
    align-items: center;
  }
  .line-1, .line-2, .line-3 {
    transform: none;
    text-align: center;
  }
  .hero-subtitle {
    transform: none;
    text-align: center;
    font-size: 16px;
  }
}
</style>
