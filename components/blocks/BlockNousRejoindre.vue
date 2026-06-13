<template>
    <section
        class="block-nous-rejoindre"
        :style="{ background: backgroundGradient }"
        :class="[visibilityClasses, { triggered: isTriggered }]"
    >
        <div class="circle circle-left"></div>
        <div class="circle circle-right"></div>
        <div class="circle circle-small"></div>

        <NuxtLink :to="link || '/contact'" class="cta-link">
            {{ title }}
        </NuxtLink>
    </section>
</template>

<script setup>
import { computed } from "vue";

const {
    backgroundGradient = "",
    title = "",
    link = "/contact",
    visibility = {},
    isTriggered = false,
} = defineProps({
    backgroundGradient: { type: String, default: "" },
    title: { type: String, default: "" },
    link: { type: String, default: "/contact" },
    visibility: { type: Object, default: () => ({}) },
    isTriggered: { type: Boolean, default: false },
});

const isEditor = inject("isEditor", false);

const visibilityClasses = computed(() => ({
    "hide-mobile": visibility.mobile === false,
    "hide-tablet": visibility.tablet === false,
    "hide-desktop": visibility.desktop === false,
}));
</script>

<style scoped>
.block-nous-rejoindre {
    container-type: inline-size;
    view-timeline: --rejoindre;
    padding: 80px 24px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 40px;
    position: relative;
    overflow: hidden;
    min-height: 500px;
}

.circle {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
}

.circle-left {
    width: 400px;
    height: 400px;
    background: rgba(255, 255, 255, 0.15);
    animation: nr-circle-left both;
    animation-timeline: --rejoindre;
    animation-range: cover 0% cover 50%;
}

.circle-right {
    width: 600px;
    height: 600px;
    background: rgba(255, 255, 255, 0.08);
    animation: nr-circle-right both;
    animation-timeline: --rejoindre;
    animation-range: cover 0% cover 50%;
}

.circle-small {
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.9);
    animation: nr-circle-small both;
    animation-timeline: --rejoindre;
    animation-range: cover 0% cover 50%;
}

.cta-link {
    position: relative;
    z-index: 1;
    color: white;
    font-family: "Playfair Display", Georgia, serif;
    font-style: italic;
    font-size: clamp(2em, 5vw, 4em);
    font-weight: 700;
    text-align: center;
    text-decoration: none;
    line-height: 1.1;
    animation: nr-cta both;
    animation-timeline: --rejoindre;
    animation-range: cover 0% cover 50%;
}

@keyframes nr-circle-left {
    0% {
        transform: translate(calc(-50% - 350px), calc(-50% - 150px)) scale(0.6);
        opacity: 0;
    }
    100% {
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 1;
    }
}

@keyframes nr-circle-right {
    0% {
        transform: translate(calc(-50% + 400px), calc(-50% + 80px)) scale(0.7);
        opacity: 0.1;
    }
    100% {
        transform: translate(-50%, -50%) scale(1.1);
        opacity: 0.9;
    }
}

@keyframes nr-circle-small {
    0% {
        transform: translate(calc(-50% - 100px), calc(-50% + 200px)) scale(0.4);
        opacity: 0;
    }
    100% {
        transform: translate(-50%, -50%) scale(1.1);
        opacity: 1;
    }
}

@keyframes nr-cta {
    0% {
        transform: translateY(0) scale(0.25);
        opacity: 0;
    }
    100% {
        transform: translateY(320px) scale(1);
        opacity: 1;
    }
}

.triggered .circle-left {
    animation: none;
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
}
.triggered .circle-right {
    animation: none;
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.9;
}
.triggered .circle-small {
    animation: none;
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 1;
}
.triggered .cta-link {
    animation: none;
    transform: none;
    opacity: 1;
}

@container (max-width: 768px) {
    .circle-left {
        width: 250px;
        height: 250px;
    }
    .circle-right {
        width: 350px;
        height: 350px;
    }
    .circle-small {
        width: 60px;
        height: 60px;
    }
}

@container (max-width: 600px) {
    .block-nous-rejoindre {
        padding: 30px 20px;
        min-height: 220px;
    }
    .circle-left {
        width: 180px;
        height: 180px;
    }
    .circle-right {
        width: 250px;
        height: 250px;
    }
    .circle-small {
        width: 50px;
        height: 50px;
    }
}

</style>
