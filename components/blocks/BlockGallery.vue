<template>
  <section
    class="block-gallery"
    :style="{ background: backgroundColor }"
    :class="visibilityClasses"
  >
    <div class="gallery-inner">
      <h2 v-if="title" class="gallery-title" :style="{ color: textColor }">{{ title }}</h2>
      <div class="gallery-grid" :style="{ gridTemplateColumns: `repeat(${columns ?? 3}, 1fr)` }">
        <div
          v-for="(img, i) in normalizedImages"
          :key="i"
          class="gallery-item"
          @click="openLightbox(i)"
        >
          <img :src="img.src" :alt="img.alt ?? ''" class="gallery-img" />
          <div v-if="img.caption" class="gallery-caption">{{ img.caption }}</div>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <div v-if="lightboxIndex !== null" class="lightbox" @click.self="closeLightbox">
        <button class="lightbox-close" @click="closeLightbox">✕</button>
        <button class="lightbox-prev" @click="prevImage">‹</button>
        <img :src="normalizedImages[lightboxIndex]?.src" class="lightbox-img" />
        <button class="lightbox-next" @click="nextImage">›</button>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
const { visibility = {} } = defineProps({
  title: { type: String, default: '' },
  textColor: { type: String, default: '#064886' },
  images: { type: Array, default: () => [] },
  columns: { type: Number, default: 3 },
  backgroundColor: { type: String, default: '#ffffff' },
  animation: { type: String, default: 'fadeIn' },
  visibility: { type: Object, default: () => ({}) },
  isTriggered: { type: Boolean, default: false },
  previewDevice: { type: String, default: 'desktop' },
})
const lightboxIndex = ref(null)

const normalizedImages = computed(() => {
  return (images || []).map((img, index) => {
    if (typeof img === 'string') {
      return { src: img, alt: `Image ${index + 1}`, caption: '' }
    }
    return {
      src: img?.src || '',
      alt: img?.alt || `Image ${index + 1}`,
      caption: img?.caption || '',
    }
  }).filter(img => img.src)
})

const visibilityClasses = computed(() => ({
  'hide-mobile': visibility.mobile === false,
  'hide-tablet': visibility.tablet === false,
  'hide-desktop': visibility.desktop === false,
}))

function openLightbox(i) { lightboxIndex.value = i }
function closeLightbox() { lightboxIndex.value = null }
function prevImage() {
  const len = normalizedImages.value.length
  lightboxIndex.value = (lightboxIndex.value - 1 + len) % len
}
function nextImage() {
  const len = normalizedImages.value.length
  lightboxIndex.value = (lightboxIndex.value + 1) % len
}
</script>

<style scoped>
.block-gallery { container-type: inline-size; padding: 60px 24px; }
.gallery-inner { max-width: 1100px; margin: 0 auto; }
.gallery-title {
  font-family: Georgia, serif;
  font-size: clamp(1.6em, 4vw, 2.4em);
  font-style: italic;
  text-align: center;
  margin-bottom: 40px;
}
.gallery-grid { display: grid; gap: 16px; }
.gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
  aspect-ratio: 4/3;
}
.gallery-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s ease; display: block; }
.gallery-item:hover .gallery-img { transform: scale(1.06); }
.gallery-caption {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
  color: white;
  padding: 20px 12px 10px;
  font-size: 0.85em;
}

/* Lightbox */
.lightbox {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.92);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}
.lightbox-img { max-width: 90vw; max-height: 85vh; border-radius: 8px; object-fit: contain; }
.lightbox-close {
  position: absolute; top: 20px; right: 24px;
  background: none; border: none; color: white; font-size: 2em; cursor: pointer;
}
.lightbox-prev, .lightbox-next {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.1); border: none; color: white;
  font-size: 2.5em; padding: 10px 18px; cursor: pointer; border-radius: 8px;
}
.lightbox-prev { left: 16px; }
.lightbox-next { right: 16px; }
.lightbox-prev:hover, .lightbox-next:hover { background: rgba(255,255,255,0.25); }

@container (max-width: 768px) {
  .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
}

@container (max-width: 600px) {
  .block-gallery { padding: 50px 20px; }
  .gallery-grid { grid-template-columns: 1fr !important; }
}
</style>
