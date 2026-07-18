<template>
  <section class="block-stats" :style="{ background: backgroundColor, color: textColor }">
    <div class="stats-inner">
      <h2 v-if="title" class="stats-title" data-field-key="title" :style="fieldFontStyle(fieldFonts, 'title', fieldFontSizes)">{{ title }}</h2>
      <div class="stats-grid">
        <div v-for="(item, i) in items" :key="i" class="stats-item">
          <div class="stats-value">{{ item?.value }}</div>
          <div class="stats-label">{{ item?.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { fieldFontStyle } from '~/utils/fonts.js'
defineProps({
  title: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  backgroundColor: { type: String, default: '#064886' },
  textColor: { type: String, default: '#ffffff' },
  animation: { type: String, default: 'fadeIn' },
  isTriggered: { type: Boolean, default: false },
  blockId: { type: String, default: '' },
  visibility: { type: Object, default: () => ({}) },
  fieldFonts: { type: Object, default: () => ({}) },
  fieldFontSizes: { type: Object, default: () => ({}) },
})
</script>

<style scoped>
.block-stats {
  padding: 60px 24px;
}
.stats-inner {
  max-width: 1000px;
  margin: 0 auto;
}
.stats-title {
  font-family: Georgia, serif;
  font-size: clamp(1.6em, 4vw, 2.4em);
  font-style: italic;
  text-align: center;
  margin-bottom: 40px;
}
.stats-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
}
.stats-item {
  text-align: center;
  min-width: 120px;
}
.stats-value {
  font-family: Georgia, serif;
  font-size: clamp(2em, 5vw, 3em);
  font-weight: 700;
  line-height: 1.1;
}
.stats-label {
  margin-top: 8px;
  font-size: 0.95em;
  opacity: 0.85;
}

@media (max-width: 600px) {
  .block-stats { padding: 50px 20px; }
  .stats-grid { gap: 28px; }
}
</style>
