<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <!-- Logo + tagline -->
      <div class="footer-brand">
        <img src="~/assets/logo.png" alt="Cieux Ouverts" class="footer-logo" />
        <p class="footer-tagline">Il y a une place pour <em>toi !</em></p>
      </div>

      <!-- Nav -->
      <nav class="footer-nav">
        <NuxtLink to="/">Accueil</NuxtLink>
        <NuxtLink to="/messages">Messages</NuxtLink>
        <NuxtLink to="/agenda">Agenda</NuxtLink>
        <NuxtLink to="/contact">Contact</NuxtLink>
      </nav>

      <!-- Infos -->
      <div class="footer-info">
        <a href="mailto:contact@cieuxouverts.bzh" class="footer-email">contact@cieuxouverts.bzh</a>
        <p>Rdv chaque dimanche | <strong>10H</strong></p>
        <p>2 rue Jean Monnet | <strong>29600 Morlaix, Bretagne</strong></p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: #064886;
  color: white;
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 36px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 40px;
  align-items: start;
}

.footer-logo {
  height: 44px;
  width: auto;
  filter: brightness(0) invert(1);
  margin-bottom: 10px;
  display: block;
}

.footer-tagline {
  font-size: 1em;
  color: white;
  font-weight: 500;
  margin: 0;
}

.footer-tagline em {
  font-style: italic;
}

.footer-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 4px;
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
  font-size: 0.9em;
  color: white;
  padding-top: 4px;
}

.footer-email {
  color: white;
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 2px;
  display: block;
}

.footer-email:hover {
  text-decoration: underline;
}

.footer-info p {
  color: rgba(255,255,255,0.85);
  line-height: 1.6;
}

.footer-info strong {
  color: #EF4B54;
  font-weight: 700;
}

@media (max-width: 768px) {
  .footer-inner {
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 32px 20px 28px;
  }
}
</style>
