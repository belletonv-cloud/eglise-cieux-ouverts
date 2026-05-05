<template>
  <section class="block-activities" :class="visibilityClasses">
    <div class="activities-grid">
      <div 
        v-for="(item, i) in props.items" 
        :key="i" 
        class="activity-card"
        @mouseenter="hovered = i"
        @mouseleave="hovered = null"
      >
        <img :src="item.image" :alt="item.title" class="activity-img" />
        <div class="activity-overlay" :class="{ 'is-hovered': hovered === i }">
          <h3 class="activity-title">{{ item.title }}</h3>
          <p class="activity-desc" v-html="item.description.replace(/\n/g, '<br>')"></p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const p = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})

const hovered = ref(null)

const visibilityClasses = computed(() => ({
  'hide-mobile': p.visibility.mobile === false,
  'hide-tablet': p.visibility.tablet === false,
  'hide-desktop': p.visibility.desktop === false,
}))
</script>

<style scoped>
.block-activities {
  padding: 100px 24px;
  background-color: white; /* Ou gradient si nécessaire */
}

.activities-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.activity-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  cursor: pointer;
  background-color: #f4f4f4;
  flex: 0 0 auto;
}

.activity-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.activity-card:hover .activity-img {
  transform: scale(1.05);
}

.activity-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(6, 72, 134, 0.9); /* Primary purple/blue */
  color: white;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  overflow-y: auto;
}

.activity-overlay.is-hovered {
  opacity: 1;
}

.activity-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  margin-bottom: 15px;
  font-style: italic;
  font-weight: 700;
}

.activity-desc {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 400;
}

@media (max-width: 768px) {
  .block-activities {
    padding: 60px 0; /* remove horizontal padding to let slider touch edges */
  }
  .activities-grid {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 16px;
    padding: 0 24px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
  }
  .activities-grid::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
  .activity-card {
    width: 80vw;
    scroll-snap-align: center;
  }
  /* Show text naturally or tap on mobile */
  .activity-overlay {
    opacity: 0; 
  }
  .activity-overlay.is-hovered, .activity-card:active .activity-overlay {
    opacity: 1;
  }
}
</style>
