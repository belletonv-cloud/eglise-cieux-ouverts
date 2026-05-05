<template>
  <footer class="site-footer" ref="footerRef">
    <div class="footer-shutter" :class="{ 'is-open': shutterOpen }">
      <div class="footer-shutter-content">
        <h2 class="shutter-title">Il y a une place pour toi !</h2>
      </div>
    </div>
    
    <div class="footer-inner">
      <!-- Infos -->
      <div class="footer-info">
        <a href="mailto:contact@cieuxouverts.bzh" class="footer-email">contact@cieuxouverts.bzh</a>
        <p>Rdv chaque dimanche | <strong>10H</strong></p>
        <p>2 rue Jean Monnet | <strong>29600 Morlaix, Bretagne</strong></p>
      </div>

      <!-- Nav -->
      <nav class="footer-nav">
        <NuxtLink to="/">Accueil</NuxtLink>
        <NuxtLink to="/messages">Messages</NuxtLink>
        <NuxtLink to="/agenda">Agenda</NuxtLink>
        <NuxtLink to="/contact">Contact</NuxtLink>
      </nav>
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
  // Trigger when footer is well visible
  if (rect.top < vh * 0.8) {
    shutterOpen.value = true
  } else if (rect.top > vh) {
    // Reset when fully scrolled out of view upwards
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
  /* Use a gradient that matches the bottom of the contact block */
  background: linear-gradient(to bottom, #ffffff 0%, #064886 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.footer-shutter {
  width: 100%;
  padding: 60px 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}

.footer-shutter-content {
  transform: translateY(100%);
  opacity: 0;
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.8s ease;
}

.footer-shutter.is-open .footer-shutter-content {
  transform: translateY(0);
  opacity: 1;
}

.shutter-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(32px, 5vw, 60px);
  font-style: italic;
  font-weight: 700;
  color: #064886;
  margin: 0;
  text-align: center;
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 24px 60px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 40px;
  border-top: 1px solid rgba(255,255,255,0.2);
}

.footer-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: right;
}

.footer-nav a {
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  font-size: 0.95em;
  transition: color 0.2s;
}

.footer-nav a:hover,
.footer-nav a.router-link-active {
  color: white;
  text-decoration: none;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 1.05em;
  color: white;
}

.footer-email {
  color: white;
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 8px;
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
    align-items: center;
    text-align: center;
    gap: 30px;
  }
  .footer-nav {
    text-align: center;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
