<template>
  <section
    class="block-hero"
    :style="{ minHeight: props.height + 'px' }"
    :class="visibilityClasses"
  >
    <img v-if="props.image" :src="props.image" alt="Hero" class="hero-img" />
    <div class="hero-content">
      <div class="hero-bienvenue" aria-label="BIENVENUE">
        <span v-for="(letter, i) in 'BIENVENUE'" :key="i" :style="{ animationDelay: `${i * 80}ms` }">{{ letter }}</span>
      </div>
      <p class="hero-subtitle">à l'Église Cieux Ouverts à Morlaix</p>
      <NuxtLink to="/contact" class="btn-hero">Rejoins-nous</NuxtLink>
    </div>
  </section>
</template>

<script setup>
const p = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})
const props = computed(() => p.props)
const visibilityClasses = computed(() => ({
  'hide-mobile': p.visibility.mobile === false,
  'hide-tablet': p.visibility.tablet === false,
  'hide-desktop': p.visibility.desktop === false,
}))
</script>

<style scoped>
.block-hero {
  position: relative;
  overflow: hidden;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  text-align: center;
  color: white;
  padding: 80px 24px;
}

.hero-bienvenue {
  display: flex;
  font-size: clamp(2.5em, 8vw, 6em);
  font-weight: 900;
  letter-spacing: 0.2em;
  line-height: 1.1;
  margin-bottom: 20px;
  text-shadow: 0 2px 30px rgba(0,0,0,0.2);
  flex-wrap: wrap;
  justify-content: center;
}

.hero-bienvenue span {
  display: inline-block;
  opacity: 0;
  transform: translateY(30px);
  animation: letter-fade-in 0.8s forwards;
}

@keyframes letter-fade-in {
  to { opacity: 1; transform: translateY(0); }
}

.hero-subtitle {
  font-size: 1.2em;
  opacity: 0.92;
  margin-bottom: 30px;
  font-weight: 400;
}

.btn-hero {
  display: inline-block;
  background: white;
  color: #7C3AED;
  font-weight: 700;
  padding: 14px 36px;
  border-radius: 50px;
  text-decoration: none;
  margin-bottom: 40px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
.btn-hero:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.2); }

.hero-horaires {
  display: inline-flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  padding: 20px 36px;
  border-radius: 16px;
}

.horaire-label {
  font-size: 0.9em;
  opacity: 0.85;
  font-weight: 500;
}

.horaire-grid {
  display: flex;
  gap: 32px;
  justify-content: center;
}

.horaire-grid div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.horaire-grid strong {
  font-size: 1.4em;
  font-weight: 900;
}

.horaire-grid span {
  font-size: 0.82em;
  opacity: 0.85;
}

@media (max-width: 768px) {
  .hero-bienvenue { font-size: clamp(2em, 10vw, 4em); }
}
</style>
