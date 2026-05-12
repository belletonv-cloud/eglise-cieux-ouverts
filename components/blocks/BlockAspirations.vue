<template>
  <div class="aspirations-viewport" :class="visibilityClasses">
    <div
      class="sticky-box"
      :style="{ background: blockProps.props.backgroundColor, color: blockProps.props.textColor }"
    >
      <div class="aspirations-content">
        <h1 class="aspirations-title">{{ blockProps.props.title }}</h1>
        <div class="aspirations-divider"></div>
        <ol class="aspirations-list">
          <li
            v-for="(item, i) in items"
            :key="i"
            :style="getItemStyle(i)"
          >
            <span class="circle" :style="getCircleStyle(i)"></span>
            <span class="text">{{ item }}</span>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const blockProps = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})

const visibilityClasses = computed(() => ({
  'hide-mobile': blockProps.visibility.mobile === false,
  'hide-tablet': blockProps.visibility.tablet === false,
  'hide-desktop': blockProps.visibility.desktop === false,
}))

const items = computed(() => blockProps.props.items || [])
const n = computed(() => items.value.length)

function getItemStyle(index) {
  const total = n.value
  const band = 80
  const step = band / total
  const pad = (100 - band) / 2
  const start = pad + index * step
  const end = pad + band
  return {
    '--anim-start': start + '%',
    '--anim-end': end + '%',
  }
}

function getCircleStyle(index) {
  const total = n.value
  const band = 80
  const step = band / total
  const pad = (100 - band) / 2
  const start = pad + index * step
  const end = pad + band
  return {
    left: (-6 + index * 4) + 'rem',
    '--anim-start': start + '%',
    '--anim-end': end + '%',
    animationName: 'circle-' + index,
  }
}
</script>

<style scoped>
.aspirations-viewport {
  view-timeline: --cascade;
  height: 300vh;
  position: relative;
}

.sticky-box {
  position: sticky;
  top: 0;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.aspirations-content {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
}

.aspirations-title {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-weight: 700;
  font-size: 3rem;
  text-shadow: 0 1px 5px hsla(0, 0%, 0%, 0.8);
  text-align: center;
  padding-bottom: 1.5rem;
}

.aspirations-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
  margin-bottom: 1rem;
}

.aspirations-list {
  list-style: none;
  font-size: 2rem;
  padding: 0;
  margin: 0;
}

.aspirations-list li {
  position: relative;
  width: 100%;
  padding: 1rem 0 1rem 12rem;
  text-align: left;
  line-height: 1.25;
  text-shadow: 0 1px 5px hsla(0, 0%, 0%, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.aspirations-list li:last-child {
  border-bottom: none;
}

.circle {
  position: absolute;
  z-index: -1;
  width: 12vh;
  height: 12vh;
  border-radius: 50%;
  background: #1a96df;
  opacity: 0.5;
  top: 50%;
  transform: translateY(-50%);
}

.text {
  position: relative;
  z-index: 1;
  display: block;
}

@media (max-width: 768px) {
  .aspirations-viewport { height: auto; }
  .sticky-box { position: relative; top: auto; min-height: auto; padding: 50px 20px; }
  .aspirations-content { padding: 0; }
  .aspirations-title { font-size: clamp(32px, 8vw, 48px); }
  .aspirations-list li { font-size: 1.2rem; padding: 0.8rem 0; text-align: center; border-bottom: 1px solid; }
  .circle { display: none; }
}
</style>

<style>
.aspirations-viewport {
  view-timeline: --cascade;
}

@supports (animation-timeline: --cascade) {
  .aspirations-list li {
    opacity: 0;
    animation: aspir-item-in ease-out both;
    animation-timeline: --cascade;
    animation-range: cover var(--anim-start) cover var(--anim-end);
  }
}

@supports (animation-timeline: --cascade) {
  .circle {
    animation-timeline: --cascade;
    animation-range: cover var(--anim-start) cover var(--anim-end);
    animation-fill-mode: both;
    animation-timing-function: ease-out;
  }
}

@keyframes aspir-item-in {
  0%   { opacity: 0; transform: translateY(25px); }
  18%  { opacity: 1; transform: translateY(0); }
  85%  { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-15px); }
}

@keyframes circle-0 {
  0%   { opacity: 0; transform: translateY(80%); }
  18%  { opacity: 0.5; transform: translateY(-50%); }
  85%  { opacity: 0.5; transform: translateY(-50%); }
  100% { opacity: 0; transform: translateY(-150%); }
}
@keyframes circle-1 {
  0%   { opacity: 0; transform: translateY(80%); }
  18%  { opacity: 0.5; transform: translateY(calc(-50% - 4.5rem)); }
  85%  { opacity: 0.5; transform: translateY(calc(-50% - 4.5rem)); }
  100% { opacity: 0; transform: translateY(calc(-50% - 4.5rem - 100%)); }
}
@keyframes circle-2 {
  0%   { opacity: 0; transform: translateY(80%); }
  18%  { opacity: 0.5; transform: translateY(calc(-50% - 9rem)); }
  85%  { opacity: 0.5; transform: translateY(calc(-50% - 9rem)); }
  100% { opacity: 0; transform: translateY(calc(-50% - 9rem - 100%)); }
}
@keyframes circle-3 {
  0%   { opacity: 0; transform: translateY(80%); }
  18%  { opacity: 0.5; transform: translateY(calc(-50% - 13.5rem)); }
  85%  { opacity: 0.5; transform: translateY(calc(-50% - 13.5rem)); }
  100% { opacity: 0; transform: translateY(calc(-50% - 13.5rem - 100%)); }
}
@keyframes circle-4 {
  0%   { opacity: 0; transform: translateY(80%); }
  18%  { opacity: 0.5; transform: translateY(calc(-50% - 18rem)); }
  85%  { opacity: 0.5; transform: translateY(calc(-50% - 18rem)); }
  100% { opacity: 0; transform: translateY(calc(-50% - 18rem - 100%)); }
}
@keyframes circle-5 {
  0%   { opacity: 0; transform: translateY(80%); }
  18%  { opacity: 0.5; transform: translateY(calc(-50% - 22.5rem)); }
  85%  { opacity: 0.5; transform: translateY(calc(-50% - 22.5rem)); }
  100% { opacity: 0; transform: translateY(calc(-50% - 22.5rem - 100%)); }
}
</style>
