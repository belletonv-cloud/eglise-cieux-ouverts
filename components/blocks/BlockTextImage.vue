<template>
  <section
    class="block-textimage"
    :style="{ background: props.backgroundColor, color: props.textColor }"
    :class="[visibilityClasses, { 'reverse': props.reverse }, `style-${props.visualStyle || 'default'}`]"
  >
    <div class="ti-inner">
      <div class="ti-text">
        <h2 class="ti-title" :style="{ color: props.textColor }">{{ props.title }}</h2>
        <p v-if="props.subtitle" class="ti-subtitle">{{ props.subtitle }}</p>
        <div class="ti-body" v-html="props.body"></div>
        <a v-if="props.ctaText" :href="props.ctaLink" class="ti-cta">{{ props.ctaText }}</a>
      </div>
      <div class="ti-image">
        <div v-if="props.visualStyle === 'messagesLaptop'" class="ti-laptop-shell">
          <div class="ti-laptop-screen-frame">
            <div class="ti-laptop-content">
              <img v-if="props.image" :src="props.image" :alt="props.title" class="ti-img" />
              <div v-else class="ti-img-placeholder">🖼️</div>
            </div>
          </div>
          <div class="ti-laptop-base"></div>
        </div>
        <img v-else-if="props.image" :src="props.image" :alt="props.title" class="ti-img" />
        <div v-else class="ti-img-placeholder">🖼️</div>
      </div>
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
.block-textimage { container-type: inline-size; padding: 80px 24px; }
.ti-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}
.reverse .ti-inner { direction: rtl; }
.reverse .ti-inner > * { direction: ltr; }
.ti-title {
  font-family: Georgia, serif;
  font-size: clamp(1.6em, 4vw, 2.4em);
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.25;
}
.ti-subtitle {
  margin: -4px 0 22px;
  font-size: 1.4em;
  font-weight: 700;
  color: #333;
}
.ti-body { font-size: 1.05em; line-height: 1.75; opacity: 0.9; margin-bottom: 28px; }
.ti-cta {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 50px;
  background: #064886;
  color: white;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}
.ti-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
.ti-img { width: 100%; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.15); }
.ti-img-placeholder { width: 100%; aspect-ratio: 4/3; border-radius: 16px; background: rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; font-size: 3em; }

.style-messagesLaptop {
  padding: 60px 24px;
  background: white !important;
}

.style-messagesLaptop .ti-inner {
  max-width: 1120px;
  gap: 40px;
  padding: 56px 40px;
  background: #f4f4f4;
  border-radius: 22px;
  box-shadow: 0 16px 50px rgba(6, 72, 134, 0.08);
}

.style-messagesLaptop .ti-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 48px;
  font-style: italic;
  margin-bottom: 10px;
}

.style-messagesLaptop .ti-body {
  font-size: 18px;
  line-height: 1.8;
  color: #555;
}

.style-messagesLaptop .ti-subtitle {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 24px;
  color: #333;
  margin-bottom: 30px;
}

.style-messagesLaptop .ti-image {
  display: flex;
  justify-content: center;
}

.style-messagesLaptop .ti-body :deep(ul) {
  margin: 16px 0;
  padding-left: 24px;
}

.style-messagesLaptop .ti-body :deep(li) {
  margin: 10px 0;
}

.style-messagesLaptop .ti-laptop-shell {
  position: relative;
  width: 100%;
  max-width: 800px;
  perspective: 1200px;
}

.style-messagesLaptop .ti-laptop-screen-frame {
  background-color: #ffffff;
  background-image: radial-gradient(circle at 94.35% 89.61%, #054886 0%, 20%, rgba(5, 72, 134, 0) 40%), radial-gradient(circle at 9.07% 95.57%, rgba(238, 108, 113, 0.99) 0%, 25%, rgba(238, 108, 113, 0) 50%), radial-gradient(circle at 4.04% 13.51%, #054886 0%, 42%, rgba(5, 72, 134, 0) 70%), radial-gradient(circle at 93.32% 10.65%, #EF4B54 0%, 42%, rgba(239, 75, 84, 0) 70%), radial-gradient(circle at 48.90% 49.52%, #FFFFFF 0%, 100%, rgba(255, 255, 255, 0) 100%);
  border: 1px solid rgba(199, 199, 199, 1);
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  padding: 2.5%;
  position: relative;
  z-index: 2;
}

.style-messagesLaptop .ti-laptop-content {
  background: white;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.1);
}

.style-messagesLaptop .ti-laptop-content .ti-img,
.style-messagesLaptop .ti-laptop-content .ti-img-placeholder {
  border-radius: 0;
  box-shadow: none;
}

.style-messagesLaptop .ti-laptop-base {
  position: relative;
  width: 114%;
  left: -7%;
  height: 16px;
  background: linear-gradient(to bottom, #e2e2e2 0%, #a8a8a8 100%);
  border-radius: 0 0 16px 16px;
  box-shadow: inset 0 1px 2px rgba(255,255,255,0.8), 0 10px 20px rgba(0,0,0,0.25);
  z-index: 1;
  margin-top: -2px;
}

.style-messagesLaptop .ti-laptop-base::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 14%;
  height: 4px;
  background: #999;
  border-radius: 0 0 4px 4px;
}

.style-messagesLaptop .ti-cta {
  padding: 16px 32px;
  font-size: 18px;
  border-radius: 30px;
}

@container (max-width: 768px) {
  .ti-inner { grid-template-columns: 1fr; gap: 32px; }
  .reverse .ti-inner { direction: ltr; }
  .style-messagesLaptop .ti-inner { padding: 28px 16px; border-radius: 18px; }
  .style-messagesLaptop .ti-title { font-size: 36px; }
  .style-messagesLaptop .ti-subtitle { font-size: 20px; }
}

@container (max-width: 600px) {
  .block-textimage { padding: 50px 20px; }
}
</style>
