<template>
  <section
    class="block-aspirations"
    :style="{ background: blockProps.props.backgroundColor, color: blockProps.props.textColor }"
    :class="visibilityClasses"
  >
    <div class="aspirations-inner">
      <h2 class="aspirations-title" :style="{ color: blockProps.props.textColor }">{{ blockProps.props.title }}</h2>
      <ul class="aspirations-list">
        <li v-for="(item, i) in blockProps.props.items" :key="i" class="aspiration-item" :style="{ color: blockProps.props.textColor }">
          {{ item }}
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const blockProps = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})

const visibilityClasses = computed(() => ({
  'hide-mobile': blockProps.visibility.mobile === false,
  'hide-tablet': blockProps.visibility.tablet === false,
  'hide-desktop': blockProps.visibility.desktop === false,
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
