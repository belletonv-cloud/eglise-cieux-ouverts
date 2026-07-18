<template>
    <section
        class="block-bienvenue"
        :class="[visibilityClasses, { 'admin-animate': isAdmin }]"
    >
        <img
            src="/images/bienvenue-foule.png"
            alt="Foule Croix"
            class="bienvenue-img"
            loading="lazy"
        />

        <div class="bienvenue-content">
            <div class="hero-bienvenue-portal" data-field-key="title" :aria-label="props.title" :style="{ color: props.textColor, fontSize: props.fontSize + 'em', ...fieldFontStyle(props.fieldFonts, 'title', props.fieldFontSizes) }">
                <span
                    v-for="(char, i) in wordArr"
                    :key="i"
                    class="hero-bienvenue-char"
                    :style="getLetterVars(i)"
                    >{{ char === ' ' ? ' ' : char }}</span
                >
            </div>
            <p class="hero-subtitle" data-field-key="subtitle" :style="{ color: props.textColor, ...fieldFontStyle(props.fieldFonts, 'subtitle', props.fieldFontSizes) }">{{ props.subtitle }}</p>
            <div class="hero-socials">
                <a
                    href="https://www.instagram.com/eglise_cieux_ouverts/"
                    target="_blank"
                    rel="noopener"
                    aria-label="Instagram Cieux Ouverts"
                    class="social-icon"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                        />
                    </svg>
                </a>
                <a
                    href="https://www.facebook.com/eglisecieuxouverts"
                    target="_blank"
                    rel="noopener"
                    aria-label="Facebook Cieux Ouverts"
                    class="social-icon"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
                        />
                    </svg>
                </a>
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, inject, ref } from "vue";
import { fieldFontStyle } from "~/utils/fonts.js";

const props = defineProps({
    title: { type: String, default: "BIENVENUE" },
    subtitle: { type: String, default: "à l'Église Cieux Ouverts à Morlaix" },
    visibility: { type: Object, default: () => ({}) },
    fieldFonts: { type: Object, default: () => ({}) },
    fieldFontSizes: { type: Object, default: () => ({}) },
    textColor: { type: String, default: "#064886" },
    fontSize: { type: [Number, String], default: 5 },
});

const isAdmin = inject("isAdmin", ref(false));

const visibilityClasses = computed(() => ({
    "hide-mobile": props.visibility.mobile === false,
    "hide-tablet": props.visibility.tablet === false,
    "hide-desktop": props.visibility.desktop === false,
}));

// L'animation fan-out est calculée par lettre ; [...title] (plutôt que
// split('')) gère correctement les caractères accentués et emoji.
const wordArr = computed(() => [...(props.title || "")]);
const center = computed(() => (wordArr.value.length - 1) / 2);

function getLetterVars(i) {
    const c = center.value;
    const dist = Math.abs(i - c);
    const sign = i === c ? 0 : (i - c) / dist;
    const extreme = i === 0 || i === wordArr.value.length - 1 ? 1.0 : 1;
    return {
        "--dist": dist,
        "--sign": sign,
        "--extreme": extreme,
        "--spread-x": "80px",
        "--spread-y": "55px",
        "--spread-r": "15deg",
    };
}
</script>

<style scoped>
.block-bienvenue {
    view-timeline: --bienvenue;
    position: relative;
    overflow: hidden;
    width: 100%;
    margin-left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 600px;
}

.bienvenue-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    z-index: 0;
}

.bienvenue-content {
    position: relative;
    z-index: 1;
    text-align: center;
    width: 100%;
    max-width: 1200px;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.hero-bienvenue-portal {
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: var(--font-heading);
    font-size: clamp(40px, 8vw, 80px);
    line-height: 1.3;
    margin-bottom: 20px;
    position: relative;
    width: 100%;
    white-space: nowrap;
    user-select: none;
}

.hero-bienvenue-char {
    display: inline-block;
    will-change: transform, opacity;
    margin: 0 0.03em;
    color: inherit;
    opacity: 1;
    transform: translateX(0) translateY(0) rotate(0) scale(1);
}

@supports (animation-timeline: --bienvenue) {
    @media (prefers-reduced-motion: no-preference) {
        .hero-bienvenue-char {
            opacity: 0;
            animation-name: bienvenue-fan;
            animation-timeline: --bienvenue;
            animation-range: cover 0% cover 55%;
            animation-fill-mode: both;
        }
    }
}

/* Fallback: in admin mode or when admin-animate class is present, trigger standard animations immediately */
.admin-animate .hero-bienvenue-char {
    opacity: 0;
    animation-name: bienvenue-fan;
    animation-duration: 0.8s;
    animation-fill-mode: both;
    animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
    /* stagger by distance */
    animation-delay: calc(0.04s * var(--dist));
}

.admin-animate .hero-subtitle {
    opacity: 0;
    transform: translateY(30px);
    animation: subtitle-in 0.5s ease both;
    animation-delay: 0.5s;
}

.admin-animate .hero-socials {
    opacity: 0;
    transform: translateY(20px);
    animation: socials-in 0.5s ease both;
    animation-delay: 0.65s;
}

@keyframes bienvenue-fan {
    0% {
        opacity: 0;
        transform: translateX(calc(var(--spread-x) * var(--dist) * var(--sign)))
            translateY(
                calc(-1 * var(--spread-y) * var(--dist) * var(--extreme))
            )
            rotate(calc(var(--spread-r) * var(--dist) * var(--sign)))
            scale(0.04);
    }
    100% {
        opacity: 1;
        transform: translateX(0) translateY(0) rotate(0) scale(1);
    }
}

.hero-subtitle {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 17.5px;
    font-weight: 400;
    margin-top: 20px;
    opacity: 0;
    transform: translateY(30px);
}

@supports (animation-timeline: --bienvenue) {
    @media (prefers-reduced-motion: no-preference) {
        .hero-subtitle {
            animation: subtitle-in 0.5s ease both;
            animation-timeline: --bienvenue;
            animation-range: cover 45% cover 60%;
        }
    }
}

@keyframes subtitle-in {
    0% {
        opacity: 0;
        transform: translateY(30px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

.hero-socials {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    opacity: 0;
    transform: translateY(20px);
}

@supports (animation-timeline: --bienvenue) {
    @media (prefers-reduced-motion: no-preference) {
        .hero-socials {
            animation: socials-in 0.5s ease both;
            animation-timeline: --bienvenue;
            animation-range: cover 55% cover 70%;
        }
    }
}

@keyframes socials-in {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

.social-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(5, 72, 134, 0.85);
    color: white;
    text-decoration: none;
    transition:
        background 0.2s,
        transform 0.2s;
}

.social-icon:hover {
    background: #054886;
    transform: scale(1.1);
}

@media (max-width: 768px) {
    .block-bienvenue {
        min-height: 400px;
    }
    .hero-bienvenue-portal {
        font-size: clamp(18px, 7vw, 36px);
        letter-spacing: 0.01em;
    }
    .hero-bienvenue-char {
        --spread-x: 30px;
        --spread-y: 25px;
        --spread-r: 6deg;
    }
    .hero-subtitle {
        font-size: 16px;
        margin-top: 15px;
    }
    .hero-socials {
        margin-top: 16px;
    }
}

@media (max-width: 480px) {
    .block-bienvenue {
        min-height: 320px;
    }
    .hero-bienvenue-portal {
        font-size: clamp(14px, 6.5vw, 28px);
        letter-spacing: 0;
    }
    .hero-subtitle {
        font-size: 14px;
    }
}
</style>
