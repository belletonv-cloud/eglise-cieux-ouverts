<template>
  <section
    class="block-youtube"
    :style="{ background: backgroundColor }"
    :class="[visibilityClasses, containerAnim.animClass, { triggered: containerAnim.triggered }]"
  >
    <div class="youtube-inner">
      <div class="youtube-player" v-if="videoId && hasValidId" :ref="containerAnim.setRef">
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
      <div v-else class="youtube-placeholder" :ref="containerAnim.setRef">
        <p class="placeholder-text">{{ placeholderText }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAnimatedElements } from '~/composables/useAnimatedElements'

const props = defineProps({
  videoId: { type: String, default: '' },
  title: { type: String, default: '' },
  backgroundColor: { type: String, default: '#ffffff' },
  animation: { type: String, default: 'fadeIn' },
  visibility: { type: Object, default: () => ({}) },
  isTriggered: { type: Boolean, default: false },
  blockId: { type: String, default: '' },
})

const { addElement, blockStates } = useAnimatedElements(props.blockId)
const containerAnim = addElement('container', { animation: props.animation || 'fadeIn', delay: 0 })

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
</script>

<style scoped>
.block-youtube {
  width: 100%;
  padding: 60px 24px;
}

.youtube-inner {
  max-width: 900px;
  margin: 0 auto;
}

.youtube-player {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  background: white;
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
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.placeholder-text {
  color: #888;
  font-size: 0.9em;
  text-align: center;
  padding: 20px;
}

</style>
