<template>
  <footer class="site-footer" ref="footerRef">
    <div class="footer-inner">
      <div class="footer-left">
        <h2 class="footer-title">
          <span 
            v-for="(char, i) in titleChars" 
            :key="i" 
            class="shutter-char"
            :class="{ 'place-bold': i >= 10 && i <= 14, 'in-view': revealed }"
            :style="{ animationDelay: `${i * 0.12}s` }"
          >
            {{ char === ' ' ? '&nbsp;' : char }}
          </span>
        </h2>
      </div>
      
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
const revealed = ref(false)

const titleChars = "Il y a une place pour toi !".split('')

onMounted(() => {
  const check = () => {
    if (!footerRef.value || revealed.value) return
    const rect = footerRef.value.getBoundingClientRect()
    if (rect.top < window.innerHeight) {
      revealed.value = true
    }
  }
  window.addEventListener('scroll', check, { passive: true })
  check()
  onUnmounted(() => window.removeEventListener('scroll', check))
})
</script>

<style>
@font-face {
  font-family: 'wfont_9e41cf_58d674eb74ea449ba1ce06533c9a9704';
  src: url("https://static.wixstatic.com/ufonts/9e41cf_58d674eb74ea449ba1ce06533c9a9704/woff2/file.woff2") format("woff2"),
       url("https://static.wixstatic.com/ufonts/9e41cf_58d674eb74ea449ba1ce06533c9a9704/woff/file.woff") format("woff"),
       url("https://static.wixstatic.com/ufonts/9e41cf_58d674eb74ea449ba1ce06533c9a9704/ttf/file.ttf") format("truetype");
  font-display: swap;
}
</style>

<style scoped>
.site-footer {
  background: linear-gradient(to bottom, #064886 0%, #064886 20%, #b8d4e8 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

  .footer-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 28px 24px 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 40px;
  }

.footer-left {
  flex: 1;
}

.footer-title {
  font-family: 'wfont_9e41cf_58d674eb74ea449ba1ce06533c9a9704', 'Nunito', sans-serif;
  font-size: 24px;
  font-weight: 400;
  color: #ffffff;
  margin: 0;
  white-space: nowrap;
}

.shutter-char {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.shutter-char::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to right,
    #064886 0,
    #064886 6px,
    transparent 6px,
    transparent 12px
  );
  transform: translateX(0);
  pointer-events: none;
}

.shutter-char.in-view::before {
  animation: reveal 1.4s ease-out forwards;
}

@keyframes reveal {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}

.place-bold {
  font-weight: 700;
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
  font-size: 19px;
  font-weight: 700;
  color: white;
  text-align: left;
  font-family: 'wfont_9e41cf_58d674eb74ea449ba1ce06533c9a9704', 'Nunito', sans-serif;
}

.footer-email {
  color: white;
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 4px;
  font-size: 19px;
  display: block;
}

.footer-email:hover {
  text-decoration: underline;
}

.footer-info p {
  color: white;
  line-height: 1.6;
  margin: 0;
}

.footer-info strong {
  font-weight: 700;
  color: #064886;
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
    font-size: 24px;
    text-align: center;
  }
  .footer-email {
    margin-bottom: 4px;
    font-size: 1em;
  }
}
</style>
