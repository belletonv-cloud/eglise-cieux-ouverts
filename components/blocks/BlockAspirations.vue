<template>
  <section
    class="block-aspirations"
    :style="{ background: props.backgroundColor, color: props.textColor }"
    :class="[visibilityClasses, { 'is-triggered': isTriggered }]"
  >
    <div class="aspirations-inner">
      <h2 class="aspirations-title" :style="{ color: props.textColor }">{{ props.title }}</h2>
      <ul class="aspirations-list">
        <li 
          v-for="(item, i) in props.items" 
          :key="i" 
          class="aspiration-item" 
          :style="{ color: props.textColor, transitionDelay: `${i * 0.2 + 0.3}s` }"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const p = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
  isTriggered: { type: Boolean, default: false },
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
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 40px;
}

.aspirations-title {
  font-family: 'Playfair Display', serif;
  font-size: 75px;
  font-weight: 400;
  line-height: 1.3;
  margin: 0;
  opacity: 0;
  transform: translateX(-30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.block-aspirations.is-triggered .aspirations-title {
  opacity: 1;
  transform: translateX(0);
}

.aspirations-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
}

.aspiration-item {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.4;
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 50px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.block-aspirations.is-triggered .aspiration-item {
  opacity: 1;
  transform: translateY(0);
}

.aspiration-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white; /* Matches the small empty circle vector graphic */
  background: transparent;
}

@media (max-width: 768px) {
  .aspirations-inner {
    align-items: center;
    text-align: center;
  }
  .aspirations-title {
    font-size: clamp(40px, 8vw, 75px);
  }
  .aspiration-item {
    font-size: clamp(20px, 5vw, 36px);
    padding-left: 0;
    justify-content: center;
  }
  .aspiration-item::before {
    display: none;
  }
}
</style>
