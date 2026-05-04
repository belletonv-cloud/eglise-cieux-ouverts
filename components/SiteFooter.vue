<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <img src="~/assets/logo.png" alt="Cieux Ouverts" class="footer-logo" />
        <p class="footer-tagline">Église Cieux Ouverts — Morlaix</p>
      </div>

      <nav class="footer-nav">
        <NuxtLink to="/">Accueil</NuxtLink>
        <NuxtLink to="/messages">Messages</NuxtLink>
        <NuxtLink to="/agenda">Agenda</NuxtLink>
        <NuxtLink to="/contact">Contact</NuxtLink>
      </nav>

      <div class="footer-contact">
        <p>Rdv chaque dimanche à 10h00</p>
        <p>2 rue Jean Monnet — 29600 Morlaix</p>
        <a href="mailto:contact@cieuxouverts.bzh">contact@cieuxouverts.bzh</a>
        <div class="footer-socials">
          <a href="https://www.facebook.com/eglisecieuxouverts" target="_blank" rel="noopener" aria-label="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
          </a>
          <a href="https://www.instagram.com/eglise_cieux_ouverts/" target="_blank" rel="noopener" aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© {{ new Date().getFullYear() }} Église Cieux Ouverts — Morlaix, Bretagne</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--text-dark);
  color: rgba(255,255,255,0.75);
  margin-top: auto;
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 24px 32px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 40px;
}

.footer-logo {
  height: 48px;
  width: auto;
  filter: brightness(0) invert(1);
  margin-bottom: 10px;
}

.footer-tagline { font-size: 0.9em; opacity: 0.7; }

.footer-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-nav a {
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  font-size: 0.95em;
  transition: color 0.2s;
}

.footer-nav a:hover { color: white; text-decoration: none; }

.footer-contact {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9em;
}

.footer-contact a { color: rgba(255,255,255,0.75); text-decoration: none; }
.footer-contact a:hover { color: white; }

.footer-socials { display: flex; gap: 12px; margin-top: 8px; }
.footer-socials a { color: rgba(255,255,255,0.6); transition: color 0.2s; }
.footer-socials a:hover { color: white; }

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.1);
  text-align: center;
  padding: 16px 24px;
  font-size: 0.82em;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .footer-inner {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 32px 16px 24px;
  }
}
</style>
