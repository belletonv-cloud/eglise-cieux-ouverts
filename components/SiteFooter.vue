<template>
  <footer class="site-footer" ref="footerRef">
    <div class="footer-inner">
      <!-- Partie gauche : Titre avec effet stores (chaque lettre tourne sur elle-même) -->
      <div class="footer-left">
        <h2 class="footer-title">
          <span 
            v-for="(char, i) in titleChars" 
            :key="i" 
            class="shutter-char" 
            :style="getCharStyle(i)"
          >
            {{ char === ' ' ? '&nbsp;' : char }}
          </span>
        </h2>
      </div>
      
      <!-- Partie droite : Infos -->
      <div class="footer-right">
        <div class="footer-info">
          <a href="mailto:contact@cieuxouverts.bzh" class="footer-email">contact@cieuxouverts.bzh</a>
          <p>Rdv chaque dimanche | <strong>10H</strong></p>
          <p>2 rue Jean Monnet | <strong>29600 Morlaix, Bretagne</strong></p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const footerRef = ref(null)
const scrollProgress = ref(0)

const titleChars = "Il y a une place pour toi !".split('')

const onScroll = () => {
  if (!footerRef.value) return
  const rect = footerRef.value.getBoundingClientRect()
  const vh = window.innerHeight
  // Commence à s'animer quand le footer rentre dans l'écran
  const start = vh
  // Finit l'animation quand le footer est bien visible (ex: 75% de l'écran)
  const end = vh * 0.75
  
  if (rect.top > start) {
    scrollProgress.value = 0
  } else if (rect.top < end) {
    scrollProgress.value = 1
  } else {
    scrollProgress.value = 1 - ((rect.top - end) / (start - end))
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

function getCharStyle(i) {
  const p = scrollProgress.value
  const total = titleChars.length
  
  // Effet de vague (wave delay)
  // Chaque lettre a un petit délai basé sur son index
  const delay = (i / total) * 0.4
  const progress = Math.max(0, Math.min(1, (p - delay) / (1 - 0.4)))
  
  // Rotation de 90deg (invisible) à 0deg (visible)
  const rotX = 90 * (1 - progress)
  
  return {
    transform: `rotateX(${rotX}deg)`,
    opacity: progress === 0 ? 0 : 1
  }
}
</script>

<style scoped>
.site-footer {
  /* Le footer commence bleu #064886 et va progressivement vers du blanc #ffffff */
  background: linear-gradient(to bottom, #064886 0%, #064886 40%, #ffffff 100%);
  position: relative;
  overflow: hidden;
  min-height: 250px;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
}

.footer-left {
  flex: 1;
}

.footer-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(24px, 4vw, 45px); /* Tient sur une ligne */
  font-weight: 700;
  color: #ffffff; /* Texte blanc sur le fond bleu du haut du footer */
  margin: 0;
  white-space: nowrap;
  perspective: 1000px; /* Pour la profondeur 3D de la rotation X */
}

.shutter-char {
  display: inline-block;
  transform-origin: center center;
  will-change: transform, opacity;
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
  font-size: 1.05em;
  color: white;
  text-align: right;
}

.footer-email {
  color: white;
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 12px;
  font-size: 1.2em;
  display: block;
}

.footer-email:hover {
  text-decoration: underline;
}

.footer-info p {
  color: rgba(255,255,255,0.9);
  line-height: 1.6;
  margin: 0;
}

.footer-info strong {
  font-weight: 700;
  color: white;
}

@media (max-width: 768px) {
  .site-footer {
    background: rgb(238, 108, 113);
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
    font-size: clamp(18px, 6vw, 26px);
    text-align: center;
  }
  .footer-email {
    margin-bottom: 4px;
    font-size: 1em;
  }
}
</style>
