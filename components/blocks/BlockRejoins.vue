<template>
    <section
        class="block-rejoins"
        :style="{ background: backgroundGradient || '#064886' }"
        :class="[visibilityClasses, { triggered: isTriggered }]"
    >
        <div class="rejoins-inner">
            <div class="rejoins-text-container">
                <p class="rejoins-title">{{ title }}</p>
                <p class="rejoins-subtitle">{{ subtitle }}</p>
                <p class="rejoins-location">{{ location }}</p>
            </div>
            <div class="rejoins-grid">
                <div
                    v-for="(h, i) in horaires"
                    :key="i"
                    class="rejoins-horaire"
                    :style="{ transitionDelay: 0.2 + i * 0.12 + 's', '--item-delay': i * 0.12 + 's' }"
                >
                    <span class="horaire-time">{{ h.heure }}</span>
                    <span class="horaire-label">{{ h.label }}</span>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed } from "vue";

const {
    backgroundGradient = "",
    title = "",
    subtitle = "",
    location = "",
    horaires = [],
    visibility = {},
    isTriggered = false,
} = defineProps({
    backgroundGradient: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    location: { type: String, default: "" },
    horaires: { type: Array, default: () => [] },
    visibility: { type: Object, default: () => ({}) },
    isTriggered: { type: Boolean, default: false },
});

const visibilityClasses = computed(() => ({
    "hide-mobile": visibility.mobile === false,
    "hide-tablet": visibility.tablet === false,
    "hide-desktop": visibility.desktop === false,
}));


</script>

<style scoped>
.block-rejoins {
    container-type: inline-size;
    padding: 100px 24px;
    color: white;
    overflow: visible;
    position: relative;
    min-height: 600px;
    view-timeline: --rejoins;
}
.rejoins-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 120px;
}
.rejoins-text-container {
    display: flex;
    flex-direction: column;
    gap: 5px;
    will-change: transform, opacity;
    opacity: 0;
    transform: translateX(-120px);
    transition:
        opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: 0s;
}
.rejoins-grid {
    display: flex;
    flex-direction: column;
    gap: 50px;
    align-items: flex-start;
}
.rejoins-horaire {
    display: flex;
    flex-direction: column;
    gap: 0;
    will-change: transform, opacity;
    opacity: 0;
    transform: translateY(60px);
    transition:
        opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.triggered .rejoins-text-container,
.triggered .rejoins-horaire {
    opacity: 1;
    transform: none;
}

/* Scroll-driven — text glides from left, horaires from below */
/* Wide ranges so animation is visible (not done before entry)  */
/* Staggered horaires via --item-delay animation-delay          */
/* Scrolling down: text in (0-40%), then horaires (30-60%)      */
/* Scrolling up:   horaires leave (60-30%), then text (40-0%)  */
@keyframes text-from-left {
    0%   { opacity: 0; transform: translateX(-120px); }
    40%  { opacity: 1; transform: translateX(0); }
    100% { opacity: 1; transform: translateX(0); }
}
@keyframes horaires-from-below {
    0%   { opacity: 0; transform: translateY(60px); }
    30%  { opacity: 0; transform: translateY(60px); }
    60%  { opacity: 1; transform: translateY(0); }
    100% { opacity: 1; transform: translateY(0); }
}
@supports (animation-timeline: view()) {
    .rejoins-text-container {
        animation: text-from-left ease-in-out both;
        animation-timeline: --rejoins;
        animation-range: cover 0% cover 100%;
    }
    .rejoins-horaire {
        animation: horaires-from-below ease-in-out both;
        animation-timeline: --rejoins;
        animation-range: cover 0% cover 100%;
        animation-delay: var(--item-delay, 0s);
    }
}

.rejoins-title {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 75px;
    font-weight: 700;
    letter-spacing: -0.75px;
    line-height: 1.1;
    margin: 0;
    color: white;
}
.rejoins-subtitle,
.rejoins-location {
    font-family: "Playfair Display", serif;
    font-size: 75px;
    font-weight: 700;
    font-style: italic;
    line-height: 1.1;
    margin: 0;
    color: white;
}
.horaire-time {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 75px;
    font-weight: 700;
    line-height: 1;
    color: white;
}
.horaire-label {
    font-family: "Playfair Display", serif;
    font-size: 30px;
    font-weight: 700;
    font-style: normal;
    color: white;
    letter-spacing: -0.3px;
    margin-top: 5px;
}
@container (max-width: 900px) {
    .rejoins-inner {
        flex-direction: column;
        text-align: center;
        gap: 60px;
    }
    .rejoins-grid {
        align-items: center;
    }
    .rejoins-title,
    .rejoins-subtitle,
    .rejoins-location,
    .horaire-time {
        font-size: clamp(40px, 8vw, 75px);
    }
    .horaire-label {
        font-size: 24px;
    }
}
@container (max-width: 600px) {
    .block-rejoins {
        padding: 50px 20px;
        min-height: 400px;
    }
}

</style>
