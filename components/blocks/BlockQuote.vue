<template>
  <section class="block-quote" :style="{ background: backgroundColor, color: textColor }">
    <div class="quote-inner">
      <blockquote class="quote-text">{{ quote }}</blockquote>
      <cite v-if="author" class="quote-author">{{ author }}</cite>
    </div>
  </section>
</template>

<script setup>
defineProps({
  quote: { type: String, default: '' },
  author: { type: String, default: '' },
  backgroundColor: { type: String, default: '#f8f9fa' },
  textColor: { type: String, default: '#064886' },
  animation: { type: String, default: 'fadeIn' },
  isTriggered: { type: Boolean, default: false },
  blockId: { type: String, default: '' },
  visibility: { type: Object, default: () => ({}) },
})
</script>

<style scoped>
.block-quote {
  padding: 70px 24px;
}
.quote-inner {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}
.quote-text {
  font-family: Georgia, serif;
  font-style: italic;
  font-size: clamp(1.3em, 3.5vw, 1.8em);
  line-height: 1.5;
  margin: 0;
  quotes: '« ' ' »';
}
.quote-text::before {
  content: open-quote;
}
.quote-text::after {
  content: close-quote;
}
.quote-author {
  display: block;
  margin-top: 20px;
  font-style: normal;
  font-size: 0.9em;
  opacity: 0.75;
}

@media (max-width: 600px) {
  .block-quote { padding: 50px 20px; }
}
</style>
