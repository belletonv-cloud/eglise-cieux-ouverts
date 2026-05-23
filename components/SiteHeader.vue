<template>
  <header class="site-header" :class="{ scrolled: isScrolled, 'menu-open': menuOpen }" :style="headerStyle">
    <div class="header-inner">
      <NuxtLink to="/" class="brand">
        <img src="/logo-nav.png" alt="Cieux Ouverts" class="logo" />
      </NuxtLink>

      <nav class="nav-desktop">
        <template v-for="item in navItems" :key="item.id">
          <NuxtLink v-if="!adminMode && item.visible !== false && (item.id !== 'billetterie' || showBilletterie)"
            :to="item.to"
            active-class="active"
            @click="closeMenu"
          >{{ item.label }}</NuxtLink>
          <a v-if="adminMode && (item.visible !== false || true)"
            href="#"
            class="nav-admin-link"
            :class="{ dimmed: !item.visible }"
            @click.prevent="onNavClick($event, item)"
          >{{ item.label }}</a>
          <!-- Sub-items -->
          <template v-if="item.children?.length">
            <NuxtLink v-if="!adminMode" v-for="sub in item.children" :key="sub.id"
              :to="sub.to" @click="closeMenu"
            >{{ sub.label }}</NuxtLink>
            <a v-if="adminMode" v-for="sub in item.children" :key="sub.id"
              href="#" class="nav-admin-link sub-link"
              @click.prevent="onNavClick($event, sub)"
            >{{ sub.label }}</a>
          </template>
        </template>
        <div class="nav-desktop-socials">
          <a href="https://www.instagram.com/eglise_cieux_ouverts/" target="_blank" rel="noopener" aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://www.facebook.com/eglisecieuxouverts" target="_blank" rel="noopener" aria-label="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
          </a>
        </div>
      </nav>

      <button @click="toggleMenu" class="burger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>

    <nav class="nav-mobile">
      <template v-for="item in navItems" :key="item.id">
        <NuxtLink v-if="!adminMode && item.visible !== false && (item.id !== 'billetterie' || showBilletterie)"
          :to="item.to" @click="closeMenu"
        >{{ item.label }}</NuxtLink>
        <a v-if="adminMode" href="#" class="nav-admin-link"
          :class="{ dimmed: !item.visible }"
          @click.prevent="onNavClick($event, item)"
        >{{ item.label }}</a>
        <template v-for="sub in (item.children || [])" :key="sub.id">
          <NuxtLink v-if="!adminMode && sub.visible !== false"
            :to="sub.to" @click="closeMenu" class="sub-link"
          >— {{ sub.label }}</NuxtLink>
          <a v-if="adminMode" href="#" class="nav-admin-link sub-link"
            @click.prevent="onNavClick($event, sub)"
          >— {{ sub.label }}</a>
        </template>
      </template>
      <div class="nav-mobile-socials">
        <a href="https://www.instagram.com/eglise_cieux_ouverts/" target="_blank" rel="noopener" aria-label="Instagram">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        </a>
        <a href="https://www.facebook.com/eglisecieuxouverts" target="_blank" rel="noopener" aria-label="Facebook">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
        </a>
      </div>
    </nav>
  </header>
  <div class="header-spacer"></div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue'
import MenuEditor from '~/components/editor/MenuEditor.vue'

const menuOpen = ref(false)
const isScrolled = ref(false)
const route = useRoute()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const adminMode = inject('isAdmin', ref(false))
const headerStyle = computed(() => ({
  top: adminMode.value ? '48px' : '0px'
}))
const { hasEvenements } = useChurchEvents()
const showBilletterie = computed(() => isAdminRoute.value || hasEvenements.value)

// Menu editor integration — intercept clicks in admin mode
const { menuItems: _m, menuEditorOpen, openMenuEditor, getVisibleItems, getMenuItems } = useMenuEditor()
const navItems = computed(() => adminMode.value ? getMenuItems() : getVisibleItems())

function onNavClick(e, item) {
  if (adminMode.value) {
    e.preventDefault()
    openMenuEditor(item.id)
  } else {
    closeMenu()
  }
}

function toggleMenu() {
  if (adminMode.value) {
    openMenuEditor()
  } else {
    menuOpen.value = !menuOpen.value
    document.body.style.overflow = menuOpen.value ? 'hidden' : ''
  }
}

function closeMenu() {
  if (menuOpen.value) {
    menuOpen.value = false
    document.body.style.overflow = ''
  }
}

function onScroll() {
  isScrolled.value = window.scrollY > 20
}

watch(() => route.fullPath, () => { closeMenu() })

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu()
  })
  const mq = window.matchMedia('(min-width: 769px)')
  mq.addEventListener('change', (e) => {
    if (e.matches) closeMenu()
  })
})

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
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  gap: 32px;
  position: relative;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo {
  height: 52px;
  width: auto;
  object-fit: contain;
  display: block;
}

.nav-desktop {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.nav-desktop a, .nav-admin-link {
  padding: 8px 16px;
  font-weight: 500;
  color: #064886;
  text-decoration: none;
  transition: color 0.2s;
  font-size: 0.95em;
  font-family: Helvetica, Arial, sans-serif;
}

.nav-desktop a:hover, .nav-admin-link:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.nav-desktop a.active, .nav-admin-link.active {
  color: #EF4B54;
  text-decoration: none;
  border-bottom: 2px solid #EF4B54;
  font-weight: 600;
}
.nav-admin-link.dimmed {
  opacity: 0.5;
  pointer-events: none;
}

.nav-desktop-socials {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.nav-desktop-socials a {
  display: flex;
  align-items: center;
  padding: 6px;
  color: #064886;
  transition: color 0.2s;
}

.nav-desktop-socials a:hover {
  color: #EF4B54;
}

.burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
}

.burger span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--text-dark);
  border-radius: 2px;
  transition: transform 0.3s, opacity 0.3s;
}

.site-header.menu-open .burger span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.site-header.menu-open .burger span:nth-child(2) { opacity: 0; }
.site-header.menu-open .burger span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.nav-mobile {
  display: none;
  flex-direction: column;
  padding: 0 24px 16px;
  border-top: 1px solid var(--border-light);
  gap: 4px;
}

.site-header.menu-open .nav-mobile { display: flex; }

.nav-mobile a, .nav-mobile .nav-admin-link {
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 500;
  color: #064886;
  text-decoration: none;
  transition: color 0.2s;
  font-family: Helvetica, Arial, sans-serif;
}

.nav-mobile a:hover, .nav-mobile .nav-admin-link:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.nav-mobile a.active, .nav-mobile .nav-admin-link.active {
  color: #EF4B54;
  text-decoration: none;
  border-bottom: 2px solid #EF4B54;
  font-weight: 600;
}
.nav-mobile .nav-admin-link.dimmed {
  opacity: 0.5;
  pointer-events: none;
}
.nav-mobile a.sub-link, .nav-mobile .nav-admin-link.sub-link {
  padding-left: 32px;
  font-size: 0.9em;
  color: #555;
}

.header-spacer { height: 76px; }

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
  .site-header.menu-open {
    background: #064886;
    border-bottom: none;
    box-shadow: none;
  }
  .site-header.menu-open .burger span {
    background: white;
  }
  .site-header.menu-open .logo {
    filter: brightness(0) invert(1);
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
    background: url('/foule-croix.png') center center / cover no-repeat;
    padding: 14px 12px 18px;
    gap: 8px;
    overflow-y: auto;
    border-top: none;
    box-shadow: none;
  }
  .site-header.menu-open .nav-mobile { display: flex; }
  .nav-mobile a {
    padding: 14px 16px;
    font-size: 1.15em;
    font-weight: 700;
    background: transparent;
    border: none;
    color: #064886;
    text-shadow: 0 1px 4px rgba(255,255,255,0.6);
    text-decoration: none;
    border-radius: 0;
  }
  .nav-mobile a:hover {
    text-decoration: underline;
    text-underline-offset: 5px;
  }
  .nav-mobile a.active {
    color: #EF4B54;
    border-bottom: 2px solid #EF4B54;
    text-shadow: 0 1px 4px rgba(255,255,255,0.6);
  }
  .nav-mobile-socials {
    margin-top: auto;
    padding: 16px;
    display: flex;
    gap: 20px;
    justify-content: center;
  }
  .nav-mobile-socials a {
    color: #064886;
    padding: 0;
    font-size: 0;
    text-shadow: none;
    background: rgba(255,255,255,0.5);
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .nav-mobile-socials a:hover {
    background: rgba(255,255,255,0.8);
    text-decoration: none;
  }
  .header-spacer {
    height: 56px;
  }
}
</style>

<style>
/* Global fallback: ensure site header is offset below admin toolbar when in admin mode */
#app-root.admin-mode .site-header {
  top: var(--admin-offset, 48px) !important;
}
/* Also offset the spacer to prevent content from snapping up */
#app-root.admin-mode .header-spacer {
  height: calc(76px + var(--admin-offset, 48px));
}
@media (max-width: 768px) {
  #app-root.admin-mode .header-spacer {
    height: calc(56px + var(--admin-offset, 48px));
  }
}
</style>
