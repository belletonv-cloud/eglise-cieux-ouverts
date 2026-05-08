<template>
  <section
    class="block-aspirations"
    :style="{ background: props.backgroundColor, color: props.textColor }"
    :class="[visibilityClasses, { 'is-visible': isVisible }]"
    ref="sectionRef"
  >
    <div class="aspirations-inner">
      <h2 class="aspirations-title">{{ props.title }}</h2>
      <div class="aspirations-list">
        <div
          v-for="(item, i) in props.items"
          :key="i"
          class="aspiration-line"
          :style="{ '--delay': i * 0.15 + 's' }"
        >
          <span class="circle-slot">
            <span class="aspiration-circle"></span>
          </span>
          <span class="aspiration-text">{{ item }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})

const visibilityClasses = computed(() => ({
  'hide-mobile': props.visibility.mobile === false,
  'hide-tablet': props.visibility.tablet === false,
  'hide-desktop': props.visibility.desktop === false,
}))

const sectionRef = ref(null)
const isVisible = ref(false)
let observer = null

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        isVisible.value = true
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  if (sectionRef.value) observer.observe(sectionRef.value)
})

onUnmounted(() => { if (observer) observer.disconnect() })
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
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
}

.aspiration-line {
  display: grid;
  grid-template-columns: 55px 1fr;
  align-items: center;
  column-gap: 18px;
  padding: 18px 0;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  font-family: Helvetica, Arial, sans-serif;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.4;

  /* initial hidden state */
  transform: translateY(100px);
  opacity: 0;
  transition: transform 420ms cubic-bezier(.2,.9,.3,1), opacity 320ms ease-out;
  transition-delay: var(--delay, 0s);
}

.is-visible .aspiration-line {
  transform: translateY(0);
  opacity: 1;
}

.aspiration-line:last-child {
  border-bottom: none;
}

.circle-slot {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.aspiration-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(26, 150, 223, 0.55);
  transform: scale(0.92);
  opacity: 0;
  transition: transform 320ms cubic-bezier(.2,.9,.3,1), opacity 200ms ease-out;
  transition-delay: calc(var(--delay, 0s) + 60ms);
}

.is-visible .aspiration-circle {
  transform: scale(1);
  opacity: 1;
}

@container (max-width: 768px) {
  .aspirations-inner { align-items: center; text-align: center; }
  .aspirations-title { font-size: clamp(32px, 8vw, 60px); }
  .aspiration-line {
    font-size: clamp(16px, 4.5vw, 28px);
    padding: 14px 0;
  }
  .circle-slot { width: 40px; }
  .aspiration-circle {
    width: 14px;
    height: 14px;
  }
}

@container (max-width: 600px) {
  .block-aspirations { padding: 50px 20px; }
}
</style>
