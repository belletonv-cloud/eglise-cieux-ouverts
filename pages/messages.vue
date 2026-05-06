<template>
  <div class="page-messages">
    <!-- Hero / En-tête -->
    <section class="messages-hero">
      <div class="messages-layout">
        <div class="messages-copy">
          <h1 class="hero-title">Nos messages</h1>
          <h2 class="hero-subtitle">Cieux Ouverts est aussi en ligne !</h2>
          <div class="hero-text">
            <p>Les messages partagés à l'église ne sont pas faits pour s'arrêter au dimanche.</p>
            <p>📺 Replonge dans la parole sur notre chaîne YouTube :</p>
            <ul class="hero-points">
              <li>(Re)découvre les messages qui t'ont touché.</li>
              <li>Laisse Dieu te parler à nouveau, ou d'une manière nouvelle.</li>
              <li>Partage-les avec tes proches pour semer l'espérance autour de toi.</li>
            </ul>
            <p>
              Que ce soit pour approfondir, réentendre une parole qui t'a marqué(e),
              ou rester connecté(e) dans la semaine, ces moments sont là pour toi.
            </p>
            <p class="hero-highlight">Abonne-toi dès maintenant pour ne rien manquer et garde la flamme allumée.</p>
          </div>
          <a href="https://www.youtube.com/@cieuxouverts" target="_blank" rel="noopener" class="youtube-btn">
            Notre chaîne YouTube
          </a>
        </div>

        <div class="laptop-shell" aria-hidden="true">
          <div class="laptop-screen">
            <div class="screen-topbar">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="screen-content">
              <div class="video-card main-video">
                <div class="play-badge">▶</div>
                <div>
                  <p class="video-label">Dernier message</p>
                  <p class="video-title">Retrouve les prédications et enseignements en ligne</p>
                </div>
              </div>
              <div class="video-grid">
                <div class="video-card small"></div>
                <div class="video-card small"></div>
                <div class="video-card small"></div>
                <div class="video-card small"></div>
              </div>
            </div>
          </div>
          <div class="laptop-base"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Plus besoin de fetch Firebase, la page devient purement un point d'entrée (statique).
</script>

<style scoped>
.page-messages {
  min-height: calc(100vh - 250px);
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
}

.messages-hero {
  max-width: 1120px;
  width: 100%;
  background: #f4f4f4;
  border-radius: 22px;
  padding: 56px 40px;
  box-shadow: 0 16px 50px rgba(6, 72, 134, 0.08);
}

.messages-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 460px);
  gap: 40px;
  align-items: center;
}

.messages-copy {
  text-align: left;
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: 48px;
  color: #064886;
  margin-bottom: 10px;
  font-style: italic;
}

.hero-subtitle {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 24px;
  color: #333;
  margin-bottom: 30px;
  font-weight: 700;
}

.hero-text {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 18px;
  line-height: 1.8;
  color: #555;
  margin-bottom: 40px;
}

.hero-text p {
  margin: 10px 0;
}

.hero-points {
  margin: 16px 0;
  padding-left: 24px;
  text-align: left;
  color: #555;
}

.hero-points li {
  margin: 10px 0;
}

.hero-highlight {
  font-weight: 700;
  color: #333;
}

.laptop-shell {
  position: relative;
}

.laptop-screen {
  background: linear-gradient(180deg, #20273b 0%, #131827 100%);
  border-radius: 18px 18px 10px 10px;
  padding: 12px;
  box-shadow: 0 22px 40px rgba(15, 23, 42, 0.2);
  border: 1px solid rgba(255,255,255,0.35);
}

.screen-topbar {
  display: flex;
  gap: 6px;
  padding: 4px 4px 10px;
}

.screen-topbar span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(255,255,255,0.5);
}

.screen-content {
  background: linear-gradient(135deg, #f7f9fd 0%, #eef3fb 100%);
  border-radius: 10px;
  padding: 16px;
}

.video-card {
  border-radius: 16px;
  background: linear-gradient(135deg, #064886 0%, #2f73bf 100%);
  color: white;
}

.main-video {
  min-height: 180px;
  padding: 22px;
  display: flex;
  align-items: flex-end;
  gap: 14px;
  margin-bottom: 12px;
}

.play-badge {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: rgba(255,255,255,0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
  flex-shrink: 0;
}

.video-label {
  font-size: 0.78em;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.82;
  margin-bottom: 6px;
}

.video-title {
  font-size: 1.02em;
  font-weight: 700;
  line-height: 1.35;
}

.video-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.video-card.small {
  min-height: 78px;
  background: linear-gradient(135deg, #dbe7f7 0%, #c8d9ef 100%);
  position: relative;
  overflow: hidden;
}

.video-card.small::after {
  content: '';
  position: absolute;
  inset: auto 12px 12px;
  height: 8px;
  border-radius: 999px;
  background: rgba(6, 72, 134, 0.22);
}

.laptop-base {
  width: 112%;
  height: 14px;
  margin: 0 auto;
  transform: translateX(-5.5%);
  border-radius: 0 0 18px 18px;
  background: linear-gradient(180deg, #d5dae4 0%, #aeb7c5 100%);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.14);
}

.youtube-btn {
  display: inline-block;
  background-color: #064886;
  color: white;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 30px;
  text-decoration: none;
  transition: background-color 0.3s, transform 0.2s;
}

.youtube-btn:hover {
  background-color: #043360;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .page-messages {
    padding: 28px 12px;
  }
  .messages-hero {
    padding: 28px 16px;
    border-radius: 18px;
  }
  .messages-layout {
    grid-template-columns: 1fr;
    gap: 22px;
  }
  .messages-copy {
    text-align: center;
  }
  .hero-title {
    font-size: 36px;
  }
  .hero-subtitle {
    font-size: 20px;
  }
  .hero-text {
    font-size: 16px;
  }
  .hero-points {
    padding-left: 18px;
    text-align: left;
  }
  .main-video {
    min-height: 150px;
    padding: 18px;
  }
  .video-grid {
    gap: 8px;
  }
}
</style>
