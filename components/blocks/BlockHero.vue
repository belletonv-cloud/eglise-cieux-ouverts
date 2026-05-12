<template>
  <section
    class="block-main-hero"
    :class="visibilityClasses"
  >
    <img src="https://static.wixstatic.com/media/d65230_b70cb082138448849de83ccab78d3ed7~mv2.png/v1/fill/w_1920,h_1141,al_c,q_95,usm_0.66_1.00_0.01,enc_avif,quality_auto/d65230_b70cb082138448849de83ccab78d3ed7~mv2.png" alt="Sky background" class="hero-bg" />
    
    <div class="hero-content">
      <img src="https://static.wixstatic.com/media/d65230_556da516fccc4add9424fa0586c62330~mv2.png/v1/crop/x_154,y_2,w_411,h_85/fill/w_575,h_88,fp_0.50_0.50,lg_1,q_85,enc_avif,quality_auto/(NEW)%20Cieux%20Ouverts-01-NL.png" alt="Cieux Ouverts" class="hero-name" />
      <img src="https://static.wixstatic.com/media/d65230_e393fcbc29d74d8694d53aa88bba03c5~mv2.png/v1/crop/x_0,y_0,w_232,h_132/fill/w_150,h_85,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/g149-8.png" alt="Logo" class="hero-logo" />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const { visibility = {} } = defineProps({
  visibility: { type: Object, default: () => ({}) },
})

const visibilityClasses = computed(() => ({
  'hide-mobile': visibility.mobile === false,
  'hide-tablet': visibility.tablet === false,
  'hide-desktop': visibility.desktop === false,
}))
</script>

<style scoped>
.block-main-hero {
  container-type: inline-size;
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  height: 72vh;
  min-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-top: -70px;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  animation: hero-in 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes hero-in {
  0%   { opacity: 0; transform: translateY(80px); }
  100% { opacity: 1; transform: translateY(0); }
}

.hero-name {
  width: 100%;
  max-width: 575px;
  height: auto;
  object-fit: contain;
}

.hero-logo {
  width: 100%;
  max-width: 150px;
  height: auto;
  object-fit: contain;
}

@container (max-width: 768px) {
  .block-main-hero { margin-top: -56px; min-height: 360px; }
  .hero-name { max-width: 80vw; }
  .hero-logo { max-width: 100px; }
}

@container (max-width: 600px) {
  .block-main-hero { height: 60vh; min-height: 300px; }
  .hero-name { max-width: 85vw; }
  .hero-logo { max-width: 80px; }
  .hero-content { gap: 24px; }
}
</style>
