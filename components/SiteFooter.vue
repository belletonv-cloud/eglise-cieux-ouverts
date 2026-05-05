<template>
  <footer class="site-footer">
    <div class="footer-hero">
      <h2 class="footer-title">Il y a une place pour <em>toi !</em></h2>
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

<style scoped>
.site-footer {
  /* Use a gradient that matches the bottom of the contact block */
  background: linear-gradient(to bottom, #ffffff 0%, #064886 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.footer-hero {
  width: 100%;
  padding: 80px 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(40px, 6vw, 75px);
  font-weight: 700;
  color: #064886;
  margin: 0;
  text-align: center;
}

.footer-title em {
  font-style: italic;
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0px 24px 60px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 40px;
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
    align-items: center;
    text-align: center;
    gap: 40px;
  }
  .footer-nav {
    text-align: center;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
