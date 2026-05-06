<template>
  <footer class="site-footer" ref="footerRef">
    <div class="footer-inner">

      <!-- Colonne gauche : accroche animée + logo -->
      <div class="footer-col footer-col-left">
        <h2 class="footer-title" aria-label="Il y a une place pour toi !">
          <span
            v-for="(char, i) in titleChars"
            :key="i"
            class="shutter-char"
            :style="getCharStyle(i)"
          >{{ char === ' ' ? '\u00a0' : char }}</span>
        </h2>
        <img src="/logo-nav.png" alt="Cieux Ouverts" class="footer-logo" :style="logoStyle" />
      </div>

      <!-- Colonne centre : infos pratiques -->
      <div class="footer-col footer-col-center" :style="infoStyle">
        <p class="footer-label">Rdv chaque dimanche</p>
        <p class="footer-value">10H</p>
        <p class="footer-label" style="margin-top: 16px;">2 rue Jean Monnet</p>
        <p class="footer-value">29600 Morlaix, Bretagne</p>
      </div>

      <!-- Colonne droite : contact + réseaux -->
      <div class="footer-col footer-col-right" :style="contactStyle">
        <p class="footer-cta-title">Tu veux nous contacter ?</p>
        <p class="footer-cta-sub">Tu as une question ?<br>Tu désires parler à un pasteur ?</p>
        <a href="mailto:contact@cieuxouverts.bzh" class="footer-email">contact@cieuxouverts.bzh</a>

        <div class="footer-socials">
          <!-- Instagram -->
          <a href="https://www.instagram.com/eglise_cieux_ouverts/" target="_blank" rel="noopener" aria-label="Instagram" class="social-link">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <!-- Facebook -->
          <a href="https://www.facebook.com/eglisecieuxouverts/" target="_blank" rel="noopener" aria-label="Facebook" class="social-link">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
          </a>
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
  const start = vh
  const end = vh * 0.6

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
onUnmounted(() => window.removeEventListener('scroll', onScroll))

function getCharStyle(i) {
  const p = scrollProgress.value
  const total = titleChars.length
  const delay = (i / total) * 0.5
  const progress = Math.max(0, Math.min(1, (p - delay) / (1 - 0.5)))
  const rotX = 90 * (1 - progress)
  return {
    transform: `rotateX(${rotX}deg)`,
    opacity: progress < 0.05 ? 0 : 1
  }
}

const logoStyle = computed(() => {
  const p = scrollProgress.value
  return {
    opacity: p,
    transform: `translateY(${20 * (1 - p)}px)`,
    transition: 'opacity 0.1s linear, transform 0.1s linear'
  }
})

const infoStyle = computed(() => {
  const p = scrollProgress.value
  const progress = Math.max(0, Math.min(1, (p - 0.1) / 0.9))
  return {
    opacity: progress,
    transform: `translateX(${-30 * (1 - progress)}px)`,
    transition: 'opacity 0.1s linear, transform 0.1s linear'
  }
})

const contactStyle = computed(() => {
  const p = scrollProgress.value
  const progress = Math.max(0, Math.min(1, (p - 0.2) / 0.8))
  return {
    opacity: progress,
    transform: `translateX(${30 * (1 - progress)}px)`,
    transition: 'opacity 0.1s linear, transform 0.1s linear'
  }
})
</script>

<style scoped>
.site-footer {
  background-color: rgb(119, 54, 57);
  position: relative;
  overflow: hidden;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 40px 50px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 48px;
  align-items: start;
}

/* Colonne gauche */
.footer-col-left {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.footer-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(22px, 2.8vw, 38px);
  font-weight: 700;
  font-style: italic;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
  perspective: 800px;
}

.shutter-char {
  display: inline-block;
  transform-origin: center center;
  will-change: transform, opacity;
}

.footer-logo {
  height: 56px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) invert(1);
  will-change: opacity, transform;
}

/* Colonne centre */
.footer-col-center {
  will-change: opacity, transform;
}

.footer-label {
  font-family: 'Nunito', Helvetica, Arial, sans-serif;
  font-weight: 300;
  font-size: 16px;
  color: rgba(255,255,255,0.75);
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.footer-value {
  font-family: 'Nunito', Helvetica, Arial, sans-serif;
  font-weight: 800;
  font-size: 22px;
  color: #ffffff;
  margin: 0;
}

/* Colonne droite */
.footer-col-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  will-change: opacity, transform;
}

.footer-cta-title {
  font-family: 'Nunito', Helvetica, Arial, sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #ffffff;
  margin: 0;
}

.footer-cta-sub {
  font-family: 'Nunito', Helvetica, Arial, sans-serif;
  font-weight: 300;
  font-size: 15px;
  color: rgba(255,255,255,0.8);
  margin: 0;
  line-height: 1.6;
}

.footer-email {
  font-family: 'Nunito', Helvetica, Arial, sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #ffffff;
  text-decoration: none;
  margin-top: 8px;
  display: inline-block;
  border-bottom: 1px solid rgba(255,255,255,0.4);
  padding-bottom: 2px;
  transition: border-color 0.2s;
}

.footer-email:hover {
  border-color: white;
}

.footer-socials {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.social-link {
  color: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  transition: color 0.2s, transform 0.2s;
}

.social-link:hover {
  color: #ffffff;
  transform: translateY(-2px);
}

/* Mobile */
@media (max-width: 768px) {
  .site-footer {
    background-color: rgb(238, 108, 113);
  }
  .footer-inner {
    grid-template-columns: 1fr;
    padding: 36px 20px 32px;
    gap: 28px;
    text-align: center;
  }
  .footer-col-left {
    align-items: center;
  }
  .footer-title {
    font-size: clamp(20px, 6vw, 28px);
  }
  .footer-col-center,
  .footer-col-right {
    align-items: center;
  }
  .footer-socials {
    justify-content: center;
  }
}
</style>
