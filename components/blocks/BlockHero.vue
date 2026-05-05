<template>
  <section
    class="block-hero"
    :style="{ height: props.height + 'px' }"
    :class="visibilityClasses"
  >
    <img :src="props.image" alt="Hero" class="hero-img" />
    <div v-if="props.overlay" class="hero-overlay" :style="{ background: props.overlayColor }"></div>
    <div v-if="props.overlayText" class="hero-overlay-text">{{ props.overlayText }}</div>
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
</script>

<style scoped>
.block-hero {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  position: relative;
  overflow: hidden;
}
.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.hero-overlay {
  position: absolute;
  inset: 0;
}
.hero-overlay-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: clamp(1.5em, 4vw, 3em);
  font-weight: 700;
  text-align: center;
  padding: 20px;
  text-shadow: 0 2px 20px rgba(0,0,0,0.5);
}
</style>
