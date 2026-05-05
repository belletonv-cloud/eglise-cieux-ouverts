<template>
  <section
    class="block-bienvenue"
    :style="{ background: props.backgroundColor }"
    :class="visibilityClasses"
    ref="sectionRef"
  >
    <div class="bienvenue-letters" :class="animClass">
      <template v-for="(group, gi) in letterGroups" :key="gi">
        <div class="letter-group" :class="{ triggered: triggered }" :style="{ '--group-delay': (gi * 0.12) + 's' }">
          <span
            v-for="(letter, li) in group"
            :key="li"
            :style="{
              color: props.textColor,
              fontSize: `clamp(3em, ${props.fontSize}vw, ${props.fontSize * 1.1}em)`,
              '--letter-delay': (li * 0.07) + 's'
            }"
          >{{ letter }}</span>
        </div>
      </template>
    </div>
    <p class="bienvenue-subtitle" :style="{ color: props.textColor + 'aa' }">{{ props.subtitle }}</p>
  </section>
</template>

<script setup>
const p = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})

const sectionRef = ref(null)
const triggered = ref(false)

// Split title into 3 groups of ~3 letters each
const letterGroups = computed(() => {
  const title = p.props.title || 'BIENVENUE'
  const size = Math.ceil(title.length / 3)
  const groups = []
  for (let i = 0; i < title.length; i += size) {
    groups.push(title.slice(i, i + size).split(''))
  }
  return groups
})

const animClass = computed(() => {
  const anim = p.props.animation || 'portal'
  return `anim-container-${anim}`
})

const visibilityClasses = computed(() => ({
  'hide-mobile': p.visibility.mobile === false,
  'hide-tablet': p.visibility.tablet === false,
  'hide-desktop': p.visibility.desktop === false,
}))

onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        triggered.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.2 }
  )
  if (sectionRef.value) observer.observe(sectionRef.value)
})
</script>

<style scoped>
.block-bienvenue {
  text-align: center;
  padding: 60px 20px 40px;
  overflow: hidden;
  perspective: 1000px;
}

.bienvenue-letters {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.letter-group {
  display: flex;
  justify-content: center;
  gap: 0.12em;
}

/* === PORTAL animation === */
.anim-container-portal .letter-group span {
  display: inline-block;
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-weight: 700;
  line-height: 1.1;
  transform: rotateY(90deg);
  opacity: 0;
  transition:
    transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.4s ease;
  transition-delay: calc(var(--group-delay, 0s) + var(--letter-delay, 0s));
}
.anim-container-portal .letter-group.triggered span {
  transform: rotateY(0deg);
  opacity: 1;
}

/* === SLIDE UP animation === */
.anim-container-slideUp .letter-group span {
  display: inline-block;
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-weight: 700;
  line-height: 1.1;
  transform: translateY(40px);
  opacity: 0;
  transition:
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.5s ease;
  transition-delay: calc(var(--group-delay, 0s) + var(--letter-delay, 0s));
}
.anim-container-slideUp .letter-group.triggered span {
  transform: translateY(0);
  opacity: 1;
}

/* === FADE IN animation === */
.anim-container-fadeIn .letter-group span,
.anim-container-none .letter-group span {
  display: inline-block;
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-weight: 700;
  line-height: 1.1;
  opacity: 0;
  transition: opacity 0.7s ease;
  transition-delay: calc(var(--group-delay, 0s) + var(--letter-delay, 0s));
}
.anim-container-fadeIn .letter-group.triggered span,
.anim-container-none .letter-group.triggered span {
  opacity: 1;
}

/* === BOUNCE animation === */
.anim-container-bounce .letter-group span {
  display: inline-block;
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-weight: 700;
  line-height: 1.1;
  transform: scale(0) translateY(-30px);
  opacity: 0;
  transition:
    transform 0.7s cubic-bezier(0.34, 1.8, 0.64, 1),
    opacity 0.4s ease;
  transition-delay: calc(var(--group-delay, 0s) + var(--letter-delay, 0s));
}
.anim-container-bounce .letter-group.triggered span {
  transform: scale(1) translateY(0);
  opacity: 1;
}

/* === FLIP animation === */
.anim-container-flip .letter-group span {
  display: inline-block;
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-weight: 700;
  line-height: 1.1;
  transform: rotateX(90deg);
  opacity: 0;
  transition:
    transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.4s ease;
  transition-delay: calc(var(--group-delay, 0s) + var(--letter-delay, 0s));
}
.anim-container-flip .letter-group.triggered span {
  transform: rotateX(0deg);
  opacity: 1;
}

.bienvenue-subtitle {
  font-size: clamp(0.9em, 2.5vw, 1.15em);
  font-weight: 400;
  margin-top: 20px;
}
</style>
