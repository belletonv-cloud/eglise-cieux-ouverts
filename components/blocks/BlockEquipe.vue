<template>
  <section
    class="block-equipe"
    :class="[visibilityClasses]"
    :style="{ background: backgroundColor, color: textColor }"
  >
    <div class="block-equipe-inner">
      <h2 class="block-equipe-title" v-if="title" :style="{ color: textColor }">{{ title }}</h2>
      <p class="block-equipe-subtitle" v-if="subtitle">{{ subtitle }}</p>
      <div class="block-equipe-grid" :style="{ '--equipe-cols': columns }">
        <div v-for="(member, i) in members" :key="i" class="equipe-card">
          <div class="equipe-photo-wrap">
            <img
              v-if="member.photo"
              :src="member.photo"
              :alt="member.name || 'Membre de l\'équipe'"
              class="equipe-photo"
              loading="lazy"
            />
            <div v-else class="equipe-photo equipe-photo-placeholder" aria-hidden="true">
              {{ initials(member.name) }}
            </div>
          </div>
          <h3 class="equipe-name">{{ member.name }}</h3>
          <p class="equipe-role" v-if="member.role">{{ member.role }}</p>
          <p class="equipe-desc" v-if="member.description">{{ member.description }}</p>
        </div>
      </div>
      <slot />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  blockId: { type: String, default: '' },
  visibility: { type: Object, default: () => ({}) },
  isTriggered: { type: Boolean, default: false },
  'is-admin': { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  members: { type: Array, default: () => [] },
  columns: { type: Number, default: 3 },
  backgroundColor: { type: String, default: '#ffffff' },
  textColor: { type: String, default: '#064886' },
  animation: { type: String, default: 'fadeIn' },
})

const { visibility = {} } = props

function initials(name) {
  return (name || '?')
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const visibilityClasses = computed(() => ({
  'hide-mobile': visibility.mobile === false,
  'hide-tablet': visibility.tablet === false,
  'hide-desktop': visibility.desktop === false,
}))
</script>

<style scoped>
.block-equipe {
  padding: 70px 24px;
  container-type: inline-size;
  text-align: center;
}

.block-equipe-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.block-equipe-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.6em, 3.2vw, 2.6em);
  margin-bottom: 8px;
}

.block-equipe-subtitle {
  font-size: 1.05em;
  opacity: 0.75;
  margin-bottom: 40px;
}

.block-equipe-grid {
  display: grid;
  grid-template-columns: repeat(var(--equipe-cols, 3), 1fr);
  gap: 36px 28px;
  margin-top: 32px;
}

.equipe-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.equipe-photo-wrap {
  width: 130px;
  height: 130px;
  margin-bottom: 14px;
}

.equipe-photo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 6px 18px rgba(6, 72, 134, 0.18);
}

.equipe-photo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #064886 0%, #5a9fcf 100%);
  color: #fff;
  font-size: 2em;
  font-weight: 700;
  font-family: 'Playfair Display', Georgia, serif;
}

.equipe-name {
  font-size: 1.15em;
  font-weight: 700;
  margin: 0 0 2px;
}

.equipe-role {
  font-size: 0.92em;
  opacity: 0.7;
  margin: 0 0 8px;
}

.equipe-desc {
  font-size: 0.88em;
  line-height: 1.55;
  opacity: 0.85;
  max-width: 280px;
  margin: 0 auto;
}

@container (max-width: 768px) {
  .block-equipe-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (max-width: 480px) {
  .block-equipe-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .block-equipe {
    padding: 48px 20px;
  }
}
</style>
