<template>
  <section
    class="block-textimage"
    :style="{ background: props.backgroundColor, color: props.textColor }"
    :class="[visibilityClasses, { 'reverse': props.reverse }]"
  >
    <div class="ti-inner">
      <div class="ti-text">
        <h2 class="ti-title" :style="{ color: props.textColor }">{{ props.title }}</h2>
        <div class="ti-body" v-html="props.body"></div>
        <a v-if="props.ctaText" :href="props.ctaLink" class="ti-cta">{{ props.ctaText }}</a>
      </div>
      <div class="ti-image">
        <img v-if="props.image" :src="props.image" :alt="props.title" class="ti-img" />
        <div v-else class="ti-img-placeholder">🖼️</div>
      </div>
    </div>
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
.block-textimage { container-type: inline-size; padding: 80px 24px; }
.ti-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}
.reverse .ti-inner { direction: rtl; }
.reverse .ti-inner > * { direction: ltr; }
.ti-title {
  font-family: Georgia, serif;
  font-size: clamp(1.6em, 4vw, 2.4em);
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.25;
}
.ti-body { font-size: 1.05em; line-height: 1.75; opacity: 0.9; margin-bottom: 28px; }
.ti-cta {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 50px;
  background: #064886;
  color: white;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}
.ti-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
.ti-img { width: 100%; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.15); }
.ti-img-placeholder { width: 100%; aspect-ratio: 4/3; border-radius: 16px; background: rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; font-size: 3em; }
@container (max-width: 768px) {
  .ti-inner { grid-template-columns: 1fr; gap: 32px; }
  .reverse .ti-inner { direction: ltr; }
}

@container (max-width: 600px) {
  .block-textimage { padding: 40px 16px; }
}
</style>
