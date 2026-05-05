<template>
  <section
    class="block-aspirations"
    :style="{ background: props.backgroundColor, color: props.textColor }"
    :class="visibilityClasses"
  >
    <div class="aspirations-inner">
      <h2 class="aspirations-title" :style="{ color: props.textColor }">{{ props.title }}</h2>
      <ul class="aspirations-list">
        <li v-for="(item, i) in props.items" :key="i" :style="{ color: props.textColor }">
          <span class="bullet" :style="{ backgroundColor: '#60a5fa' }"></span>
          {{ item }}
        </li>
      </ul>
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
.block-aspirations {
  padding: 100px 24px;
}
.aspirations-inner {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 40px;
}
.aspirations-title {
  font-size: clamp(2.5em, 5vw, 4em);
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-weight: 700;
  margin: 0;
  flex: 1;
}
.aspirations-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}
.aspirations-list li {
  font-size: clamp(1.2em, 2vw, 1.4em);
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 20px;
}
.bullet {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
@media (max-width: 768px) {
  .aspirations-inner {
    flex-direction: column;
    gap: 40px;
  }
}
</style>
