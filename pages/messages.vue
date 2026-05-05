<template>
  <div class="page-messages">
    <!-- Hero / En-tête -->
    <section class="messages-hero">
      <div class="messages-hero-content">
        <h1 class="hero-title">Nos messages</h1>
        <h2 class="hero-subtitle">Cieux Ouverts est aussi en ligne !</h2>
        <div class="hero-text">
          <p>📢 Besoin d'un boost spirituel dans la semaine ?</p>
          <p>📺 Replonge dans la parole sur notre chaîne YouTube :</p>
          <p>(Re)découvre les messages qui t'ont touché.</p>
          <p>Laisse Dieu te parler à nouveau ou même d'une nouvelle manière.</p>
          <p>Abonne-toi dès maintenant pour ne rien manquer et garde la flamme allumée ! 🔥</p>
        </div>
        <a href="https://www.youtube.com/@cieuxouverts" target="_blank" rel="noopener" class="youtube-btn">
          Accéder à la chaîne YouTube
        </a>
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
  max-width: 800px;
  width: 100%;
  background: #f4f4f4;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
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
  .messages-hero {
    padding: 40px 20px;
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
}
</style>
