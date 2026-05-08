<template>
  <section
    class="block-aspirations"
    :style="{ background: props.backgroundColor, color: props.textColor }"
    :class="visibilityClasses"
    ref="sectionRef"
  >
    <div class="aspirations-inner">
      <h2 class="aspirations-title">{{ props.title }}</h2>
      <div class="aspirations-list">
        <div
          v-for="(item, i) in props.items"
          :key="i"
          class="aspiration-line"
          :data-index="i"
          :data-visible="visible[i] ? 'true' : 'false'"
          ref="el => (lineRefs.value[i] = el)"
          :style="{ ['--delay']: (i * 0.12) + 's' }"
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
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'

const blockProps = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})

const visibilityClasses = computed(() => ({
  'hide-mobile': blockProps.visibility.mobile === false,
  'hide-tablet': blockProps.visibility.tablet === false,
  'hide-desktop': blockProps.visibility.desktop === false,
}))

const sectionRef = ref(null)

// IntersectionObserver-driven reveal per line. We keep a minimal reactive
// array of booleans so Vue updates bindings if needed, but the observer will
// also rely on data-* and CSS variable --delay for smooth cascade delays.
const visible = ref([])
const lineRefs = ref([])
let observer = null

onMounted(async () => {
  visible.value = (blockProps.props.items || []).map(() => false)
  await nextTick()

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.target) return
      const idx = Number(entry.target.dataset.index)
      if (entry.isIntersecting) {
        visible.value[idx] = true
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.15 })

  lineRefs.value.forEach((el) => { if (el) observer.observe(el) })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
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
  will-change: transform, opacity;

  /* initial hidden state */
  transform: translateY(100px);
  opacity: 0;
  transition: transform 420ms cubic-bezier(.2,.9,.3,1), opacity 320ms ease-out;
  transition-delay: var(--delay, 0s);
}

.aspiration-line:last-child {
  border-bottom: none;
}

.circle-slot {
  flex-shrink: 0;
  width: 55px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.aspiration-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(26, 150, 223, 0.55);
  will-change: transform;
}

.aspiration-text {
  will-change: transform, opacity;
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

/* When visible is set to true (by data-visible attribute), reveal the line */
.aspiration-line[data-visible="true"] {
  transform: translateY(0);
  opacity: 1;
}

/* Subtle scale for circle on reveal to give a modern feel but no horizontal movement */
.aspiration-line[data-visible="true"] .aspiration-circle {
  transform: scale(1);
  opacity: 1;
  transition: transform 320ms cubic-bezier(.2,.9,.3,1) calc(var(--delay, 0s) + 60ms), opacity 200ms ease-out var(--delay);
}
.aspiration-circle { transform: scale(0.92); opacity: 0; }

@container (max-width: 600px) {
  .block-aspirations { padding: 50px 20px; }
}
</style>
