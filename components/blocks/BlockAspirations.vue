<template>
  <section
    class="block-aspirations"
    :style="{ background: props.backgroundColor, color: props.textColor }"
    :class="[visibilityClasses, { 'is-visible': isVisible }]"
    ref="sectionRef"
  >
    <div class="aspirations-inner">
      <h2 class="aspirations-title">{{ props.title }}</h2>
      <ul class="aspirations-list">
        <li
          v-for="(item, i) in props.items"
          :key="i"
          class="aspiration-item"
          :style="{ transitionDelay: (0.15 + i * 0.1) + 's' }"
        >
          <span class="aspiration-bullet"></span>
          {{ item }}
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, inject, onMounted } from 'vue'

const p = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})

const isEditor = inject('isEditor', false)

const visibilityClasses = computed(() => ({
  'hide-mobile': p.visibility.mobile === false,
  'hide-tablet': p.visibility.tablet === false,
  'hide-desktop': p.visibility.desktop === false,
}))

const sectionRef = ref(null)
const isVisible = ref(false)

onMounted(() => {
  if (isEditor) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isVisible.value = true
      })
    })
    return
  }
  const observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) { isVisible.value = true; observer.disconnect() } },
    { threshold: 0.15 }
  )
  if (sectionRef.value) observer.observe(sectionRef.value)
})
</script>

<style scoped>
.block-aspirations {
  container-type: inline-size;
  padding: 70px 24px;
  overflow: hidden;
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
  will-change: transform, opacity;
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1);
  transition-delay: 0s;
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
  will-change: transform, opacity;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1);
}

.aspiration-bullet {
  position: absolute;
  left: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  will-change: transform, opacity;
  opacity: 0;
  transform: scale(0);
  transition: opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.34,1.4,0.64,1);
  transition-delay: inherit;
}

/* Triggered state */
.is-visible .aspirations-title {
  opacity: 1;
  transform: none;
}
.is-visible .aspiration-item {
  opacity: 1;
  transform: none;
}
.is-visible .aspiration-bullet {
  opacity: 1;
  transform: scale(1);
}

@container (max-width: 768px) {
  .aspirations-inner { align-items: center; text-align: center; }
  .aspirations-title { font-size: clamp(40px, 8vw, 75px); }
  .aspiration-item {
    font-size: clamp(20px, 5vw, 36px);
    padding-left: 0;
    justify-content: center;
  }
  .aspiration-bullet { display: none; }
}

@container (max-width: 600px) {
  .block-aspirations { padding: 50px 20px; }
}
</style>
