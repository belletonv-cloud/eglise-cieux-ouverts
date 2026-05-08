<template>
  <section
    class="block-nous-rejoindre"
    :style="{ background: props.backgroundGradient }"
    :class="[visibilityClasses, { 'is-visible': isVisible }]"
    ref="sectionRef"
  >
    <!-- Background Circles Parallax -->
    <div class="circle circle-left"></div>
    <div class="circle circle-right"></div>
    <div class="circle circle-small"></div>

    <div class="content">
      <NuxtLink :to="props.link || '/contact'" class="cta-cercle">
        <span class="cta-text">{{ props.title }}</span>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, inject, onMounted, onUnmounted } from 'vue'

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
const isVisible = ref(isEditor)

onMounted(() => {
  if (isEditor) {
    isVisible.value = true
    return
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      // toggle visibility so circles overlap on enter and separate on leave
      isVisible.value = entry.isIntersecting
    },
    { threshold: 0.15 }
  )

  if (sectionRef.value) observer.observe(sectionRef.value)

  onUnmounted(() => observer.disconnect())
})
</script>

<style scoped>
.block-nous-rejoindre {
  container-type: inline-size;
  padding: 80px 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  min-height: 380px;
}

.circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  will-change: transform, opacity;
  opacity: 0;
}

.circle-left {
  width: 400px; height: 400px;
  background: rgba(255,255,255,0.15);
  left: 10%; top: 50%; margin-top: -200px;
  /* start off-left */
  transform: translateX(-220px) scale(0.8);
  transition: transform 0.6s cubic-bezier(0.2,0.9,0.2,1);
}

.circle-right {
  width: 600px; height: 600px;
  background: rgba(255,255,255,0.08);
  right: -5%; top: 50%; margin-top: -300px;
  /* start off-right */
  transform: translateX(220px) scale(0.9);
  transition: transform 0.6s cubic-bezier(0.2,0.9,0.2,1);
}

.circle-small {
  width: 80px; height: 80px;
  background: rgba(255,255,255,0.9);
  bottom: 20%; left: 30%;
  transform: translateY(80px) scale(0.6);
  transition: transform 0.45s cubic-bezier(0.2,0.9,0.2,1);
}

.content {
  position: relative;
  z-index: 1;
  will-change: transform, opacity;
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.34,1.2,0.64,1);
}

/* Triggered */
.is-visible .content {
  opacity: 1;
  transform: none;
}
.is-visible .circle-left {
  transform: translateX(-20px) scale(1);
}
.is-visible .circle-right {
  transform: translateX(20px) scale(1);
  opacity: 0.6;
}
.is-visible .circle-small {
  transform: translateY(0) scale(1);
}

.cta-cercle { /* kept unchanged */
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(200px, 30vw, 300px);
  height: clamp(200px, 30vw, 300px);
  border-radius: 50%;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), background-color 0.4s;
  cursor: pointer;
  position: relative;
}

.cta-cercle::before { content: ""; position: absolute; top: 10px; right: 10px; bottom: 10px; left: 10px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3); transition: transform 0.4s; }
.cta-cercle:hover { transform: scale(1.05); background-color: rgba(255,255,255,0.1); border-color: white; }
.cta-cercle:hover::before { transform: scale(0.9); border-color: rgba(255,255,255,0.8); }

.cta-text { color: white; font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-size: clamp(2em, 4vw, 3.5em); font-weight: 700; text-align: center; line-height: 1.1; padding: 20px; }

@container (max-width: 600px) {
  .block-nous-rejoindre { padding: 50px 20px; min-height: 300px; }
}

</style>
