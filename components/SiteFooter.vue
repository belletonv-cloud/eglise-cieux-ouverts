<template>
  <footer class="site-footer" ref="footerRef">
    <div class="footer-inner">
      <!-- Partie gauche : Titre avec effet rideau -->
      <div class="footer-left">
        <div class="shutter-wrapper" :class="{ 'is-open': shutterOpen }">
          <h2 class="footer-title">Il y a une place pour <em>toi !</em></h2>
        </div>
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
import { ref, onMounted, onUnmounted } from 'vue'

const footerRef = ref(null)
const shutterOpen = ref(false)

const onScroll = () => {
  if (!footerRef.value) return
  const rect = footerRef.value.getBoundingClientRect()
  const vh = window.innerHeight
  if (rect.top < vh * 0.9) {
    shutterOpen.value = true
  } else if (rect.top > vh) {
    shutterOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.site-footer {
  background: linear-gradient(to bottom, #ffffff 0%, #064886 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 80px 24px 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
}

.footer-left {
  flex: 1;
}

.shutter-wrapper {
  overflow: hidden;
  display: inline-block;
}

.footer-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(36px, 5vw, 65px);
  font-weight: 700;
  color: #064886;
  margin: 0;
  transform: translateY(100%);
  opacity: 0;
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.8s ease;
  will-change: transform, opacity;
}

.shutter-wrapper.is-open .footer-title {
  transform: translateY(0);
  opacity: 1;
}

.footer-title em {
  font-style: italic;
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
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 40px;
    padding: 60px 24px 40px;
  }
  .footer-right {
    justify-content: flex-start;
  }
  .footer-info {
    text-align: left;
  }
}
</style>
