<template>
  <header class="site-header" :class="{ scrolled: isScrolled, 'menu-open': menuOpen }">
    <div class="header-inner">
      <NuxtLink to="/" class="brand" @click="menuOpen = false">
        <img src="/logo-nav.png" alt="Cieux Ouverts" class="logo" />
      </NuxtLink>

      <nav class="nav-desktop">
        <NuxtLink to="/" exact-active-class="active">Accueil</NuxtLink>
        <NuxtLink to="/messages" active-class="active">Messages</NuxtLink>
        <NuxtLink to="/agenda" active-class="active">Agenda</NuxtLink>
        <NuxtLink to="/billetterie" active-class="active">Billetterie Événements</NuxtLink>
        <NuxtLink to="/photos" active-class="active">Photos</NuxtLink>
        <NuxtLink to="/contact" active-class="active">Contact</NuxtLink>
      </nav>

      <a href="https://www.facebook.com/eglisecieuxouverts" target="_blank" rel="noopener" class="fb-link desktop-only" aria-label="Facebook Cieux Ouverts">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
      </a>

      <button class="burger" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>

    <nav class="nav-mobile" :class="{ open: menuOpen }">
      <NuxtLink to="/" exact-active-class="active" @click="menuOpen = false">Accueil</NuxtLink>
      <NuxtLink to="/messages" active-class="active" @click="menuOpen = false">Messages</NuxtLink>
      <NuxtLink to="/agenda" active-class="active" @click="menuOpen = false">Agenda</NuxtLink>
      <NuxtLink to="/billetterie" active-class="active" @click="menuOpen = false">Billetterie Événements</NuxtLink>
      <NuxtLink to="/photos" active-class="active" @click="menuOpen = false">Photos</NuxtLink>
      <NuxtLink to="/contact" active-class="active" @click="menuOpen = false">Contact</NuxtLink>
      <a href="https://www.facebook.com/eglisecieuxouverts" target="_blank" rel="noopener" @click="menuOpen = false">Facebook</a>
    </nav>
  </header>
  <div class="header-spacer"></div>
</template>

<script setup>
const menuOpen = ref(false)
const isScrolled = ref(false)
const route = useRoute()

function onScroll() {
  isScrolled.value = window.scrollY > 20
}

watch(() => route.fullPath, () => {
  menuOpen.value = false
})

watch(menuOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

onMounted(() => window.addEventListener('scroll', onScroll))

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.site-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-light);
  transition: box-shadow 0.3s ease;
}

.site-header.scrolled {
  box-shadow: 0 2px 20px rgba(124, 58, 237, 0.12);
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo {
  height: 36px;
  width: auto;
  object-fit: contain;
}

.nav-desktop {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.nav-desktop a {
  padding: 8px 16px;
  font-weight: 500;
  color: #064886;
  text-decoration: none;
  transition: color 0.2s;
  font-size: 0.95em;
  font-family: Helvetica, Arial, sans-serif;
}

.nav-desktop a:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.nav-desktop a.active {
  color: #EF4B54;
  text-decoration: none;
  border-bottom: 2px solid #EF4B54;
  font-weight: 600;
}

.fb-link {
  color: #1877F2;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.fb-link:hover { opacity: 0.8; }

.burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  margin-left: auto;
}

.burger span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--text-dark);
  border-radius: 2px;
  transition: transform 0.3s, opacity 0.3s;
}

.menu-open .burger span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.menu-open .burger span:nth-child(2) { opacity: 0; }
.menu-open .burger span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.nav-mobile {
  display: none;
  flex-direction: column;
  padding: 0 24px 16px;
  border-top: 1px solid var(--border-light);
  gap: 4px;
}

.nav-mobile.open { display: flex; }

.nav-mobile a {
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 500;
  color: #064886;
  text-decoration: none;
  transition: color 0.2s;
  font-family: Helvetica, Arial, sans-serif;
}

.nav-mobile a:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.nav-mobile a.active {
  color: #EF4B54;
  text-decoration: none;
  border-bottom: 2px solid #EF4B54;
  font-weight: 600;
}

.header-spacer { height: 70px; }

@media (max-width: 768px) {
  .nav-desktop, .desktop-only {
    display: none;
  }
  .burger {
    display: flex;
  }
  .site-header {
    backdrop-filter: none;
    background: rgba(255,255,255,0.98);
  }
  .header-inner {
    padding: 10px 12px;
    gap: 12px;
  }
  .logo {
    height: 32px;
  }
  .brand-name {
    font-size: 0.98em;
  }
  .nav-mobile {
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255,255,255,0.98);
    padding: 14px 12px 18px;
    gap: 8px;
    overflow-y: auto;
    border-top: 1px solid var(--border-light);
    box-shadow: 0 12px 28px rgba(26, 26, 46, 0.08);
  }
  .nav-mobile a {
    padding: 12px 14px;
    font-size: 0.95em;
    background: white;
    border: 1px solid var(--border-light);
  }
  .header-spacer {
    height: 56px;
  }
}
</style>
