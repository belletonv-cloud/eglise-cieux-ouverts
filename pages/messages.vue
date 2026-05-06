<template>
  <div class="page-messages">
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
          <a href="https://www.youtube.com/@eglisecieuxouverts" target="_blank" rel="noopener" class="youtube-btn">
            Notre chaîne YouTube
          </a>
        </div>

        <div class="messages-visual">
          <div class="laptop-mockup">
            <div class="laptop-screen-frame">
              <div class="laptop-content">
                <img 
                  src="https://static.wixstatic.com/media/d65230_4715cdbb28a040dda63d2bcc671903c4~mv2.png/v1/fill/w_890,h_564,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/2.png" 
                  alt="Chaîne YouTube Cieux Ouverts" 
                  class="laptop-img"
                />
              </div>
            </div>
            <div class="laptop-base"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="video-banner">
      <div class="video-inner">
        <h3 class="video-title">Dernier message</h3>
        <div class="video-container">
          <iframe 
            :src="youtubeEmbedUrl" 
            title="Dernier message" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useHead({
  title: 'Messages — Église Cieux Ouverts'
})

const youtubeVideoId = ref('wZebQj0gR98')
const youtubeEmbedUrl = computed(() => `https://www.youtube.com/embed/${youtubeVideoId.value}`)
</script>

<style scoped>
.page-messages {
  background-color: white;
  display: flex;
  flex-direction: column;
}

.messages-hero {
  max-width: 1120px;
  width: 100%;
  margin: 0 auto;
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

.messages-visual {
  display: flex;
  justify-content: center;
}

.laptop-mockup {
  position: relative;
  width: 100%;
  max-width: 800px;
  perspective: 1200px;
}

.laptop-screen-frame {
  background-color: #ffffff;
  background-image: radial-gradient(circle at 94.35% 89.61%, #054886 0%, 20%, rgba(5, 72, 134, 0) 40%),
                    radial-gradient(circle at 9.07% 95.57%, rgba(238, 108, 113, 0.99) 0%, 25%, rgba(238, 108, 113, 0) 50%),
                    radial-gradient(circle at 4.04% 13.51%, #054886 0%, 42%, rgba(5, 72, 134, 0) 70%),
                    radial-gradient(circle at 93.32% 10.65%, #EF4B54 0%, 42%, rgba(239, 75, 84, 0) 70%),
                    radial-gradient(circle at 48.90% 49.52%, #FFFFFF 0%, 100%, rgba(255, 255, 255, 0) 100%);
  border: 1px solid rgba(199,199,199, 1);
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  padding: 2.5%;
  position: relative;
  z-index: 2;
}

.laptop-content {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 0 2px rgba(0,0,0,0.1);
}

.laptop-img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
}

.laptop-base {
  position: relative;
  width: 114%;
  left: -7%;
  height: 16px;
  background: linear-gradient(to bottom, #e2e2e2 0%, #a8a8a8 100%);
  border-radius: 0 0 16px 16px;
  box-shadow: inset 0 1px 2px rgba(255,255,255,0.8), 0 10px 20px rgba(0,0,0,0.25);
  z-index: 1;
  margin-top: -2px;
}

.laptop-base::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 14%;
  height: 4px;
  background: #999;
  border-radius: 0 0 4px 4px;
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

/* Bandeau vidéo avec dégradé */
.video-banner {
  background-color: #FFFFFF;
  background-image: radial-gradient(circle at 94.35% 89.61%, #054886 0%, 20%, rgba(5, 72, 134, 0) 40%),
                    radial-gradient(circle at 9.07% 95.57%, rgba(238, 108, 113, 0.99) 0%, 25%, rgba(238, 108, 113, 0) 50%),
                    radial-gradient(circle at 4.04% 13.51%, #054886 0%, 42%, rgba(5, 72, 134, 0) 70%),
                    radial-gradient(circle at 93.32% 10.65%, #EF4B54 0%, 42%, rgba(239, 75, 84, 0) 70%),
                    radial-gradient(circle at 48.90% 49.52%, #FFFFFF 0%, 100%, rgba(255, 255, 255, 0) 100%);
  padding: 80px 24px;
}

.video-inner {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.video-title {
  font-family: Georgia, serif;
  font-size: clamp(1.8em, 3vw, 2.5em);
  margin-bottom: 40px;
  font-style: italic;
  font-weight: 700;
  color: #064886;
}

.video-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* Ratio 16:9 */
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
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
  .messages-visual {
    order: -1;
  }
  .video-banner {
    padding: 56px 16px;
  }
}
</style>
