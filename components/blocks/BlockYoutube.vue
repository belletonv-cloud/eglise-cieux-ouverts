<template>
  <section
    class="block-youtube"
    :style="{ background: backgroundColor }"
    :class="[visibilityClasses, getAnimClass(block)]"
  >
    <div class="youtube-wrapper">
      <div class="youtube-player" v-if="videoId && hasValidId">
        <iframe
          :src="embedUrl"
          :title="title || 'Video'"
          width="100%"
          height="100%"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>
      <div v-else class="youtube-placeholder">
        <p class="placeholder-text">{{ placeholderText }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { getAnimClass } from '~/lib/blocks/renderer'

const props = defineProps({
  videoId: { type: String, default: '' },
  title: { type: String, default: '' },
  backgroundColor: { type: String, default: '#ffffff' },
  animation: { type: String, default: 'fadeIn' },
  visibility: { type: Object, default: () => ({}) },
  isTriggered: { type: Boolean, default: false },
  blockId: { type: String, default: '' },
})

const visibilityClasses = computed(() => ({
  'hide-mobile': props.visibility?.mobile === false,
  'hide-tablet': props.visibility?.tablet === false,
  'hide-desktop': props.visibility?.desktop === false,
}))

const hasValidId = computed(() => props.videoId && props.videoId.trim().length > 0)

const embedUrl = computed(() => {
  return `https://www.youtube.com/embed/${props.videoId}?rel=0&showinfo=0`
})

const placeholderText = 'Aucune vidéo configurée. En mode éditeur, entrez l\'ID YouTube.'

const block = computed(() => ({ id: props.blockId, animation: props.animation }))
</script>

<style scoped>
.block-youtube {
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 24px;
}

.youtube-wrapper {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  background: white;
}

.youtube-player {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.youtube-player iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.youtube-placeholder {
  aspect-ratio: 16 / 3;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.placeholder-text {
  color: #888;
  font-size: 0.9em;
  text-align: center;
  padding: 20px;
}
</style>
