<template>
  <section class="block-activities" :class="visibilityClasses">
    <div class="activities-container">
      <!-- Main active slide -->
      <div class="activity-main">
        <div class="activity-main-inner" @mouseenter="hovered = true" @mouseleave="hovered = false">
          <img :src="activeItem.image" :alt="activeItem.title" class="activity-main-img" />
          <div class="activity-overlay" :class="{ 'is-hovered': hovered }">
            <h3 class="activity-title">{{ activeItem.title }}</h3>
            <p class="activity-desc" v-html="activeItem.description.replace(/\n/g, '<br>')"></p>
          </div>
        </div>
        
        <!-- Navigation Arrows (optional, but good for sliders) -->
        <button class="nav-arrow prev" @click="prevSlide">‹</button>
        <button class="nav-arrow next" @click="nextSlide">›</button>
      </div>

      <!-- Thumbnails -->
      <div class="activity-thumbnails">
        <div 
          v-for="(item, i) in props.items" 
          :key="i"
          class="thumbnail-wrap"
          :class="{ 'is-active': activeIndex === i }"
          @click="activeIndex = i"
        >
          <img :src="item.image" :alt="item.title" class="thumbnail-img" />
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

const activeIndex = ref(0)
const hovered = ref(false)

const activeItem = computed(() => {
  if (!p.props.items || !p.props.items.length) return {}
  return p.props.items[activeIndex.value]
})

const visibilityClasses = computed(() => ({
  'hide-mobile': p.visibility.mobile === false,
  'hide-tablet': p.visibility.tablet === false,
  'hide-desktop': p.visibility.desktop === false,
}))

function prevSlide() {
  if (!p.props.items) return
  activeIndex.value = activeIndex.value === 0 ? p.props.items.length - 1 : activeIndex.value - 1
}

function nextSlide() {
  if (!p.props.items) return
  activeIndex.value = activeIndex.value === p.props.items.length - 1 ? 0 : activeIndex.value + 1
}
</script>

<style scoped>
.block-activities {
  container-type: inline-size;
  padding: 100px 24px;
  background-color: white;
}

.activities-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-main {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f4f4f4;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.activity-main-inner {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
}

.activity-main-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.activity-main-inner:hover .activity-main-img {
  transform: scale(1.03);
}

.activity-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.55);
  color: white;
  padding: 40px;
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
  font-size: 40px;
  margin-bottom: 20px;
  font-style: italic;
  font-weight: 700;
}

.activity-desc {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 14.5px;
  line-height: 1.6;
  font-weight: 400;
  max-width: 800px;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.8);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 30px;
  color: #064886;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 10;
}

.nav-arrow:hover {
  background: white;
}

.nav-arrow.prev {
  left: 20px;
}

.nav-arrow.next {
  right: 20px;
}

.activity-thumbnails {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 10px;
  scrollbar-width: thin;
}

.thumbnail-wrap {
  flex: 0 0 120px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s, transform 0.2s;
  border: 2px solid transparent;
}

.thumbnail-wrap:hover {
  opacity: 0.8;
}

.thumbnail-wrap.is-active {
  opacity: 1;
  border-color: #064886;
  transform: translateY(-2px);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@container (max-width: 768px) {
  .activity-main {
    aspect-ratio: 4 / 3;
  }
  .activity-title {
    font-size: 28px;
  }
  .activity-desc {
    font-size: 13px;
  }
  .activity-overlay {
    padding: 20px;
    opacity: 0;
  }
  .activity-main-inner:active .activity-overlay {
    opacity: 1;
  }
  .nav-arrow {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }
  .thumbnail-wrap {
    flex: 0 0 80px;
    height: 60px;
  }
}

@container (max-width: 600px) {
  .block-activities { padding: 50px 20px; }
}
</style>
