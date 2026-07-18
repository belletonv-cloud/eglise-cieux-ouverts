<template>
  <section
    class="block-faq"
    :class="[visibilityClasses]"
    :style="{ background: backgroundColor, color: textColor }"
  >
    <div class="block-faq-inner">
      <h2 class="block-faq-title" v-if="title" data-field-key="title" :style="{ color: textColor, ...fieldFontStyle(fieldFonts, 'title', fieldFontSizes) }">{{ title }}</h2>
      <p class="block-faq-subtitle" v-if="subtitle" data-field-key="subtitle" :style="fieldFontStyle(fieldFonts, 'subtitle', fieldFontSizes)">{{ subtitle }}</p>
      <div class="block-faq-list">
        <!-- details/summary : accordéon accessible et fonctionnel sans JS -->
        <details v-for="(item, i) in items" :key="i" class="faq-item" :open="i === 0 && openFirst">
          <summary class="faq-question">
            <span>{{ item.question }}</span>
            <span class="faq-chevron" aria-hidden="true">▾</span>
          </summary>
          <div class="faq-answer">{{ item.answer }}</div>
        </details>
      </div>
      <slot />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { fieldFontStyle } from '~/utils/fonts.js'

const props = defineProps({
  blockId: { type: String, default: '' },
  visibility: { type: Object, default: () => ({}) },
  isTriggered: { type: Boolean, default: false },
  'is-admin': { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  openFirst: { type: Boolean, default: false },
  backgroundColor: { type: String, default: '#ffffff' },
  textColor: { type: String, default: '#064886' },
  animation: { type: String, default: 'fadeIn' },
  fieldFonts: { type: Object, default: () => ({}) },
  fieldFontSizes: { type: Object, default: () => ({}) },
})

const { visibility = {} } = props

const visibilityClasses = computed(() => ({
  'hide-mobile': visibility.mobile === false,
  'hide-tablet': visibility.tablet === false,
  'hide-desktop': visibility.desktop === false,
}))
</script>

<style scoped>
.block-faq {
  padding: 70px 24px;
  container-type: inline-size;
}

.block-faq-inner {
  max-width: 820px;
  margin: 0 auto;
}

.block-faq-title {
  font-family: var(--font-heading);
  font-size: clamp(1.6em, 3.2vw, 2.6em);
  text-align: center;
  margin-bottom: 8px;
}

.block-faq-subtitle {
  text-align: center;
  font-size: 1.05em;
  opacity: 0.75;
  margin-bottom: 36px;
}

.block-faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 28px;
}

.faq-item {
  border: 1px solid rgba(6, 72, 134, 0.15);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  transition: box-shadow 0.25s ease;
}

.faq-item[open] {
  box-shadow: 0 6px 20px rgba(6, 72, 134, 0.1);
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  font-weight: 600;
  font-size: 1.02em;
  cursor: pointer;
  list-style: none;
  user-select: none;
}

.faq-question::-webkit-details-marker {
  display: none;
}

.faq-chevron {
  flex-shrink: 0;
  transition: transform 0.25s ease;
  opacity: 0.6;
}

.faq-item[open] .faq-chevron {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 20px 18px;
  line-height: 1.65;
  opacity: 0.9;
  white-space: pre-line;
}

@media (max-width: 768px) {
  .block-faq {
    padding: 48px 20px;
  }
}
</style>
