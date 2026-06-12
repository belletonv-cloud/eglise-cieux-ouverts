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
import { computed, inject, onMounted } from "vue";
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

const isEditor = inject("isEditor", false);

const visibilityClasses = computed(() => ({
    "hide-mobile": visibility.mobile === false,
    "hide-tablet": visibility.tablet === false,
    "hide-desktop": visibility.desktop === false,
}));

// Pour les animations internal, on utilise la classe triggered sur le composant
// Mais on attend un frame pour laisser le temps à l'état initial d'être appliqué
const showContent = computed(() => isEditor || isTriggered);

// Force reflow après un frame pour que l'animation CSS puisse se déclencher
onMounted(() => {
    if (!isEditor && isTriggered) {
        requestAnimationFrame(() => {
            // Force reflow pour réinitialiser les transitions
            const el = document.querySelector(".aspirations-viewport");
            if (el) {
                void el.offsetHeight;
            }
        });
    }
});

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
    height: 300vh;
    position: relative;
}
@supports (animation-timeline: view()) {
    .aspirations-viewport {
        view-timeline: --cascade;
    }
}
.sticky-box {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    opacity: 0;
    transform: translateY(20px);
    transition:
        opacity 0.6s ease,
        transform 0.6s ease;
}
.aspirations-viewport.triggered .sticky-box {
    opacity: 1;
    transform: none;
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
        opacity 0.6s ease,
        transform 0.6s ease;
}
.aspirations-viewport.triggered .aspirations-title {
    opacity: 1;
    transform: none;
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
        opacity 0.6s ease,
        transform 0.6s ease;
}
/* Cascade delays for each list item */
.aspirations-viewport.triggered .aspirations-list li:nth-child(1) {
    transition-delay: 0.1s;
}
.aspirations-viewport.triggered .aspirations-list li:nth-child(2) {
    transition-delay: 0.2s;
}
.aspirations-viewport.triggered .aspirations-list li:nth-child(3) {
    transition-delay: 0.3s;
}
.aspirations-viewport.triggered .aspirations-list li:nth-child(4) {
    transition-delay: 0.4s;
}
.aspirations-viewport.triggered .aspirations-list li:nth-child(5) {
    transition-delay: 0.5s;
}
.aspirations-viewport.triggered .aspirations-list li:nth-child(6) {
    transition-delay: 0.6s;
}

.aspirations-viewport.triggered .aspirations-list li {
    opacity: 1;
    transform: none;
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

/* IntersectionObserver fallback - show content when triggered */
@media (min-width: 769px) {
    .aspirations-viewport:not(.triggered) .aspirations-title,
    .aspirations-viewport:not(.triggered) .aspirations-list li {
        opacity: 0;
        transform: translateY(25px);
        transition:
            opacity 0.6s ease,
            transform 0.6s ease;
    }

    /* Cascade delays for each list item */
    .aspirations-viewport.triggered .aspirations-list li:nth-child(1) {
        transition-delay: 0.1s;
    }
    .aspirations-viewport.triggered .aspirations-list li:nth-child(2) {
        transition-delay: 0.2s;
    }
    .aspirations-viewport.triggered .aspirations-list li:nth-child(3) {
        transition-delay: 0.3s;
    }
    .aspirations-viewport.triggered .aspirations-list li:nth-child(4) {
        transition-delay: 0.4s;
    }
    .aspirations-viewport.triggered .aspirations-list li:nth-child(5) {
        transition-delay: 0.5s;
    }
    .aspirations-viewport.triggered .aspirations-list li:nth-child(6) {
        transition-delay: 0.6s;
    }

    .aspirations-viewport.triggered .aspirations-title,
    .aspirations-viewport.triggered .aspirations-list li {
        opacity: 1;
        transform: none;
    }

    .aspirations-viewport.triggered .circle {
        display: none !important;
    }
}
</style>
