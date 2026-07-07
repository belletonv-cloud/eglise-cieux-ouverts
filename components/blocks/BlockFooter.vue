<template>
  <footer
    class="site-footer"
    :class="{ animate: isAnimated }"
    :style="footerBgStyle"
  >
    <div class="footer-inner" :ref="titleAnim.setRef">
      <div class="footer-left">
        <h2 class="footer-title">
          <span
            v-for="(char, i) in titleChars"
            :key="i"
            class="shutter-char"
            :class="[char === ' ' ? 'space' : '', { 'place-bold': i >= titleBoldStart && i <= titleBoldEnd }]"
            :style="getShutterStyle(i)"
          >
            {{ char === ' ' ? '\u00A0' : char }}
          </span>
        </h2>
      </div>

      <div class="footer-right">
        <div class="footer-info" :style="infoStyle">
          <a :href="'mailto:' + email" class="footer-email" :style="emailStyle">{{ email }}</a>
          <p v-html="formattedSchedule"></p>
          <p v-html="formattedAddress"></p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import { useAnimatedElements } from '~/composables/useAnimatedElements'

const props = defineProps({
  title: { type: String, default: "Il y a une place pour toi !" },
  email: { type: String, default: "contact@cieuxouverts.bzh" },
  schedule: { type: String, default: "Rdv chaque dimanche | 10H" },
  address: { type: String, default: "2 rue Jean Monnet | 29600 Morlaix, Bretagne" },
  bgColorStart: { type: String, default: '#064886' },
  bgColorMid: { type: String, default: '#064886' },
  bgColorEnd: { type: String, default: '#5a9fcf' },
  bgColorMobileStart: { type: String, default: '#d46269' },
  bgColorMobileEnd: { type: String, default: '#be4f56' },
  fontSize: { type: [Number, String], default: 19 },
  titleFontSize: { type: [Number, String], default: 24 },
  textColor: { type: String, default: '#ffffff' },
  titleBoldStart: { type: Number, default: 11 },
  titleBoldEnd: { type: Number, default: 15 },
  blockId: { type: String, default: '' },
  visibility: { type: Object, default: () => ({}) },
})

const { addElement } = useAnimatedElements(props.blockId)
const titleAnim = addElement('title', { animation: 'fadeIn', delay: 0 })
const isEditor = inject('isEditor', ref(false))
const isAnimated = computed(() => titleAnim.triggered.value || isEditor.value)

const titleChars = computed(() => props.title.split(''))

const formattedSchedule = computed(() => {
  const parts = props.schedule.split('|')
  if (parts.length < 2) return props.schedule
  return parts[0] + '| <strong>' + parts[1].trim() + '</strong>'
})

const formattedAddress = computed(() => {
  const parts = props.address.split('|')
  if (parts.length < 2) return props.address
  return parts[0] + '| <strong>' + parts[1].trim() + '</strong>'
})

const footerBgStyle = computed(() => ({
  '--bf-bg-start': props.bgColorStart,
  '--bf-bg-mid': props.bgColorMid,
  '--bf-bg-end': props.bgColorEnd,
  '--bf-bg-mobile-start': props.bgColorMobileStart,
  '--bf-bg-mobile-end': props.bgColorMobileEnd,
  '--bf-text-color': props.textColor,
  '--bf-font-size': typeof props.fontSize === 'number' ? props.fontSize + 'px' : props.fontSize,
  '--bf-title-font-size': typeof props.titleFontSize === 'number' ? props.titleFontSize + 'px' : props.titleFontSize,
}))

const infoStyle = computed(() => ({
  fontSize: 'var(--bf-font-size)',
  color: 'var(--bf-text-color)',
}))

const emailStyle = computed(() => ({
  color: 'var(--bf-text-color)',
  fontSize: 'var(--bf-font-size)',
}))

function getShutterStyle(i) {
  const total = titleChars.value.length
  const step = 15 / total
  const d = i * step
  const e = d + 2
  return {
    '--shutter-d': `${d}%`,
    '--shutter-e': `${e}%`,
  }
}
</script>

<style scoped>
.site-footer {
  background: linear-gradient(to bottom, var(--bf-bg-start) 0%, var(--bf-bg-mid) 24%, var(--bf-bg-end) 100%);
  color: var(--bf-text-color, white);
  position: relative;
  overflow: hidden;
  view-timeline-name: --footer;
  view-timeline-axis: block;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 24px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
}

.footer-left {
  flex: 1;
}

.footer-title {
  font-family: 'Nunito', sans-serif;
  font-size: var(--bf-title-font-size, 24px);
  font-weight: 800;
  color: var(--bf-text-color, #ffffff);
  margin: 0;
  white-space: nowrap;
  -webkit-font-smoothing: antialiased;
}

.shutter-char {
  display: inline-block;
  clip-path: inset(0 0 0 0);
  opacity: 1;
}

/* Scroll-driven animation */
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) {
    .shutter-char {
      overflow: hidden;
      clip-path: inset(0 100% 0 0);
      opacity: 0;
      animation-name: reveal;
      animation-timeline: --footer;
      animation-range: cover var(--shutter-d) cover var(--shutter-e);
      animation-fill-mode: both;
    }
  }
}

/* Fallback: always visible + animated when in admin or when IntersectionObserver triggered */
.site-footer.animate .shutter-char {
  overflow: hidden;
  animation: reveal 0.8s ease both;
  animation-delay: calc(var(--shutter-d) * 0.14s);
}

@keyframes reveal {
  0%, 3% { clip-path: inset(0 100% 0 0); opacity: 0; }
  6%, 25% { clip-path: inset(0 0 0 0); opacity: 1; }
  28%, 50% { clip-path: inset(0 100% 0 0); opacity: 0; }
  53%, 100% { clip-path: inset(0 0 0 0); opacity: 1; }
}

.space {
  display: inline-block;
  width: 0.35em;
}

.place-bold {
  font-weight: 700;
}

.footer-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 800;
  text-align: left;
  font-family: 'Nunito', sans-serif;
  font-size: 19px;
  -webkit-font-smoothing: antialiased;
}

.footer-email {
  font-weight: 800;
  text-decoration: none;
  margin-bottom: 4px;
  display: block;
  font-size: 19px;
}

.footer-email:hover {
  text-decoration: underline;
}

.footer-email:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 3px;
  border-radius: 4px;
}

.footer-info p {
  color: var(--bf-text-color, white);
  line-height: 1.6;
  margin: 0;
}

.footer-info :deep(strong) {
  font-weight: 700;
  color: #064886;
}

@media (prefers-reduced-motion: reduce) {
  .shutter-char {
    animation: none !important;
    clip-path: inset(0 0 0 0) !important;
    opacity: 1 !important;
  }
}

@media (max-width: 768px) {
  .site-footer {
    background: linear-gradient(180deg, var(--bf-bg-mobile-start) 0%, var(--bf-bg-mobile-end) 100%);
    min-height: 0;
  }
  .footer-inner {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
    padding: 20px 10px 16px;
  }
  .footer-right {
    justify-content: center;
  }
  .footer-info {
    text-align: center;
    font-size: 0.92em;
  }
  .footer-title {
    white-space: normal;
    text-align: center;
  }
  .footer-email {
    margin-bottom: 4px;
    font-size: 1em;
  }
}
</style>
