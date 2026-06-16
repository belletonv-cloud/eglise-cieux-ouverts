<template>
  <section class="block-activities" :class="[{ 'js-ready': isHydrated }, visibilityClasses]">
    <div class="activities-container">
      <div class="activity-slider">
        <div class="activity-track" ref="slider">
          <div v-for="(item, i) in items" :key="i" class="activity-slide"
               :ref="el => { if (el) slideRefs[i] = el }">
            <img :src="item.image" :alt="item.title" class="activity-main-img" loading="lazy" />
            <label class="activity-info-overlay" :for="`act-cb-${uid}-${i}`"
                   @click.prevent="openSlideModal(i)">
              <div class="overlay-text">
                <span class="overlay-title">{{ item.title }}</span>
                <span class="overlay-desc">{{ getShortDesc(item.description) }}</span>
              </div>
              <span class="overlay-icon">ℹ</span>
            </label>
          </div>
        </div>
        <button class="nav-arrow prev" @click="scrollToSlide(currentIndex - 1)">‹</button>
        <button class="nav-arrow next" @click="scrollToSlide(currentIndex + 1)">›</button>
      </div>

      <Teleport to="body">
        <Transition name="modal">
          <div v-if="modalOpen" class="modal-backdrop" @click.self="modalOpen = false">
            <div class="modal-content">
              <button class="modal-close" @click="modalOpen = false">&times;</button>
              <img :src="activeItem.image" :alt="activeItem.title" class="modal-img" />
              <h3 class="modal-title">{{ activeItem.title }}</h3>
              <div class="modal-body" v-html="sanitizeDesc(activeItem.description)"></div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <div class="activity-thumbnails">
        <label v-for="(item, i) in items" :key="i"
               class="thumbnail-wrap" :class="{ 'is-active': currentIndex === i }"
               :for="`act-cb-${uid}-${i}`"
               @click.prevent="openThumbnailModal(i)">
          <img :src="item.image" :alt="item.title" class="thumbnail-img" loading="lazy" />
        </label>
      </div>
    </div>

    <template v-for="(item, i) in items" :key="i">
      <input type="checkbox" :id="`act-cb-${uid}-${i}`" class="act-cb" />
      <div class="act-css-modal">
        <label :for="`act-cb-${uid}-${i}`" class="act-css-bg"></label>
        <div class="modal-content">
          <label :for="`act-cb-${uid}-${i}`" class="modal-close">&times;</label>
          <img :src="item.image" :alt="item.title" class="modal-img" loading="lazy" />
          <h3 class="modal-title">{{ item.title }}</h3>
          <div class="modal-body" v-html="sanitizeDesc(item.description)"></div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const {
  items = [],
  visibility = {},
  blockId = null
} = defineProps({
  items: { type: Array, default: () => [] },
  visibility: { type: Object, default: () => ({}) },
  // optional deterministic id supplied by PageRenderer to avoid SSR/client mismatch
  blockId: { type: [String, Number], default: null }
})

// deterministic uid to avoid SSR/client mismatch when generating ids
const uid = blockId ? String(blockId) : Math.random().toString(36).slice(2, 8)
const isHydrated = ref(false)
const modalOpen = ref(false)
const currentIndex = ref(0)
const slideRefs = ref([])
const slider = ref(null)

const activeItem = computed(() => {
  if (!items || !items.length) return {}
  return items[currentIndex.value]
})

function getShortDesc(desc) {
  if (!desc) return ''
  const first = desc.split('\n')[0]
  return first.length > 120 ? first.slice(0, 120) + '…' : first
}

import { sanitizeHtml } from '~/utils/sanitize'

function sanitizeDesc(desc) {
  if (!desc) return ''
  return sanitizeHtml(desc.replace(/\n/g, '<br>'))
}

const visibilityClasses = computed(() => ({
  'hide-mobile': visibility.mobile === false,
  'hide-tablet': visibility.tablet === false,
  'hide-desktop': visibility.desktop === false,
}))

function scrollToSlide(index) {
  if (!items || !items.length) return
  const len = items.length
  const target = ((index % len) + len) % len
  currentIndex.value = target
  const el = slideRefs.value[target]
  if (el && slider.value) {
    slider.value.scrollTo({ left: el.offsetLeft, behavior: 'smooth' })
  }
}

function openModal(i) {
  if (!isHydrated.value) return
  currentIndex.value = i
  modalOpen.value = true
}

function openSlideModal(i) {
  if (!isHydrated.value) return
  openModal(i)
}

function openThumbnailModal(i) {
  if (!isHydrated.value) return
  scrollToSlide(i)
  modalOpen.value = true
}

onMounted(() => {
  isHydrated.value = true
  if (!slider.value) return
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const idx = slideRefs.value.findIndex(ref => ref === entry.target)
        if (idx >= 0) currentIndex.value = idx
      }
    }
  }, { root: slider.value, threshold: 0.5 })
  for (const ref of slideRefs.value) {
    if (ref) observer.observe(ref)
  }
  onUnmounted(() => observer.disconnect())
})
</script>

<style scoped>
.block-activities {
  container-type: inline-size;
  padding: 70px 24px;
  background-color: white;
}
.activities-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.act-cb { display: none; }

.act-css-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0,0,0,0.6);
  display: none;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.act-cb:checked + .act-css-modal {
  display: flex;
}
.act-css-bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  cursor: default;
}

.activity-slider {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}
.activity-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.activity-track::-webkit-scrollbar { display: none; }
.activity-slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
  position: relative;
  aspect-ratio: 16 / 9;
}
.activity-main-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.activity-info-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 24px;
  background: linear-gradient(transparent, rgba(0,0,0,0.75));
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  z-index: 5;
  cursor: pointer;
}
.js-ready .activity-info-overlay {
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.js-ready .activity-slide:hover .activity-info-overlay {
  opacity: 1;
  pointer-events: auto;
}
.overlay-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.overlay-title {
  color: white;
  font-family: 'Playfair Display', serif;
  font-size: 1.2em;
  font-style: italic;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}
.overlay-desc {
  color: rgba(255,255,255,0.85);
  font-size: 0.85em;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.overlay-icon {
  color: white;
  font-size: 20px;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
  text-decoration: none;
  cursor: pointer;
}
.overlay-icon:hover {
  background: rgba(0,0,0,0.8);
  transform: scale(1.1);
}
.nav-arrow { display: none; }
.js-ready .nav-arrow {
  display: flex;
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
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 10;
}
.js-ready .nav-arrow:hover { background: white; }
.js-ready .nav-arrow.prev { left: 20px; }
.js-ready .nav-arrow.next { right: 20px; }

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 640px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 48px 40px 40px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.modal-img {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 16px;
  max-height: 300px;
  object-fit: cover;
}
.modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 36px;
  color: #888;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
  text-decoration: none;
}
.modal-close:hover { color: #333; }
.modal-title {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-style: italic;
  font-weight: 700;
  color: #064886;
  margin-bottom: 16px;
}
.modal-body {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 15px;
  line-height: 1.8;
  color: #444;
}
.modal-enter-active { transition: opacity 0.3s ease; }
.modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

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
.thumbnail-wrap:hover { opacity: 0.8; }
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
  .activity-slide { aspect-ratio: 4 / 3; }
  .modal-content { padding: 36px 24px 28px; }
  .modal-title { font-size: 24px; }
  .js-ready .nav-arrow { width: 40px; height: 40px; font-size: 24px; }
  .thumbnail-wrap { flex: 0 0 80px; height: 60px; }
}
@container (max-width: 600px) {
  .block-activities { padding: 50px 20px; }
}
</style>
