<template>
    <div
        class="aspirations-viewport"
        :class="[visibilityClasses, { triggered: showContent }]"
    >
        <div
            class="sticky-box"
            :style="{
                background: backgroundGradient || backgroundColor,
                color: textColor,
            }"
        >
            <div class="aspirations-content">
                <h1 class="aspirations-title">{{ title }}</h1>
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
import { computed } from "vue";
const {
    backgroundGradient = "",
    backgroundColor = "#fff",
    textColor = "#222",
    title = "",
    items = [],
    visibility = {},
    isTriggered = false,
} = defineProps({
    backgroundGradient: { type: String, default: "" },
    backgroundColor: { type: String, default: "#fff" },
    textColor: { type: String, default: "#222" },
    title: { type: String, default: "" },
    items: { type: Array, default: () => [] },
    visibility: { type: Object, default: () => ({}) },
    isTriggered: { type: Boolean, default: false },
});

const visibilityClasses = computed(() => ({
    "hide-mobile": visibility.mobile === false,
    "hide-tablet": visibility.tablet === false,
    "hide-desktop": visibility.desktop === false,
}));

const isSsr = !import.meta.client;
const showContent = computed(() => isTriggered || isSsr);

const n = computed(() => items.length);

function getItemStyle(index) {
    const total = n.value || 1; // éviter division par zéro
    const band = 80;
    const step = band / total;
    const pad = (100 - band) / 2;
    const start = pad + index * step;
    const end = pad + band;
    return {
        "--anim-start": start + "%",
        "--anim-end": end + "%",
    };
}

function getCircleStyle(index) {
    const total = n.value || 1;
    const band = 80;
    const step = band / total;
    const pad = (100 - band) / 2;
    const start = pad + index * step;
    const end = pad + band;
    return {
        left: -6 + index * 4 + "rem",
        "--anim-start": start + "%",
        "--anim-end": end + "%",
        animationName: "circle-" + index,
    };
}
</script>

<style scoped>
/* styles inchangés */
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
    font-family: "Playfair Display", serif;
    font-style: italic;
    font-weight: 700;
    font-size: 3rem;
    text-shadow: 0 1px 5px hsla(0, 0%, 0%, 0.8);
    text-align: center;
    padding-bottom: 1.5rem;
    opacity: 0;
    transform: translateY(20px);
    transition:
        opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.aspirations-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(
        to right,
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
    );
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
    opacity: 0;
    transform: translateY(25px);
    transition:
        opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
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
    .aspirations-viewport {
        height: auto;
    }
    .sticky-box {
        position: relative;
        top: auto;
        min-height: auto;
        padding: 50px 20px;
    }
    .aspirations-content {
        padding: 0;
    }
    .aspirations-title {
        font-size: clamp(32px, 8vw, 48px);
        opacity: 1;
        transform: none;
    }
    .aspirations-list li {
        font-size: 1.2rem;
        padding: 0.8rem 0;
        text-align: center;
        border-bottom: 1px solid;
        opacity: 1;
        transform: none;
    }
    .circle {
        display: none;
    }
}

/* Keyframes et autres styles laissés intacts */
.aspirations-viewport {
    view-timeline: --cascade;
}

@supports (animation-timeline: --cascade) {
    @media (min-width: 769px) {
        .aspirations-title {
            opacity: 0;
            animation: aspir-title-in both;
            animation-timing-function: cubic-bezier(0.7, 0, 0.3, 1);
            animation-timeline: --cascade;
            animation-range: cover 0% cover 15%;
        }
        .aspirations-list li {
            opacity: 0;
            animation-name: aspir-item-in;
            animation-timing-function: cubic-bezier(0.7, 0, 0.3, 1);
            animation-fill-mode: both;
            animation-timeline: --cascade;
            animation-range: cover var(--anim-start) cover var(--anim-end);
        }
        .circle {
            animation-timing-function: cubic-bezier(0.7, 0, 0.3, 1);
            animation-fill-mode: both;
            animation-timeline: --cascade;
            animation-range: cover var(--anim-start) cover var(--anim-end);
        }
    }
}

/* Admin mode: override viewport height when block wrapper has triggered class (must come AFTER @supports) */
@supports (animation-timeline: --cascade) {
    .block-wrapper.triggered .aspirations-title,
    .block-wrapper.triggered .aspirations-list li {
        opacity: 1 !important;
        transform: none !important;
        animation: none !important;
    }
}
.block-wrapper.triggered .aspirations-title,
.block-wrapper.triggered .aspirations-list li {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
}
.block-wrapper.triggered .aspirations-viewport {
    height: auto !important;
}
.block-wrapper.triggered .aspirations-viewport .sticky-box {
    position: relative !important;
    top: auto !important;
    min-height: auto !important;
    padding: 50px 20px !important;
}

/* Fallback for browsers that don't support animation-timeline */
.block-wrapper.triggered .aspirations-viewport .aspirations-list li {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
}
.block-wrapper.triggered .aspirations-viewport .aspirations-title {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
}
.block-wrapper.triggered .aspirations-viewport .circle {
    display: none !important;
}
@keyframes aspir-title-in {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}
@keyframes aspir-item-in {
    0% {
        opacity: 0;
        transform: translateY(25px);
    }
    25% {
        opacity: 1;
        transform: translateY(0);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}
@keyframes circle-0 {
    0% {
        opacity: 0;
        transform: translateY(-80%);
    }
    25% {
        opacity: 0.5;
        transform: translateY(-50%);
    }
    100% {
        opacity: 0.5;
        transform: translateY(-50%);
    }
}
@keyframes circle-1 {
    0% {
        opacity: 0;
        transform: translateY(-80%);
    }
    25% {
        opacity: 0.5;
        transform: translateY(calc(-50% - 4.5rem));
    }
    100% {
        opacity: 0.5;
        transform: translateY(calc(-50% - 4.5rem));
    }
}
@keyframes circle-2 {
    0% {
        opacity: 0;
        transform: translateY(-80%);
    }
    25% {
        opacity: 0.5;
        transform: translateY(calc(-50% - 9rem));
    }
    100% {
        opacity: 0.5;
        transform: translateY(calc(-50% - 9rem));
    }
}
@keyframes circle-3 {
    0% {
        opacity: 0;
        transform: translateY(-80%);
    }
    25% {
        opacity: 0.5;
        transform: translateY(calc(-50% - 13.5rem));
    }
    100% {
        opacity: 0.5;
        transform: translateY(calc(-50% - 13.5rem));
    }
}
@keyframes circle-4 {
    0% {
        opacity: 0;
        transform: translateY(-80%);
    }
    25% {
        opacity: 0.5;
        transform: translateY(calc(-50% - 18rem));
    }
    100% {
        opacity: 0.5;
        transform: translateY(calc(-50% - 18rem));
    }
}
@keyframes circle-5 {
    0% {
        opacity: 0;
        transform: translateY(-80%);
    }
    25% {
        opacity: 0.5;
        transform: translateY(calc(-50% - 22.5rem));
    }
    100% {
        opacity: 0.5;
        transform: translateY(calc(-50% - 22.5rem));
    }
}
@supports (animation-timeline: --cascade) {
    /* Fallback managed via main.css */
}
</style>
