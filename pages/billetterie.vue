<template>
  <div class="page-container">
    <h1 class="page-title">Billetterie Événements</h1>
    <p class="page-subtitle">Découvrez et réservez vos places pour nos prochains événements.</p>
    
    <div class="events-list">
      <div class="event-card">
        <h3>Aucun événement pour le moment</h3>
        <p>Revenez bientôt pour de nouvelles dates.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.page-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px;
  text-align: center;
}

.page-title {
  font-size: 2.5em;
  font-weight: 700;
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 1.1em;
  color: var(--text-medium);
  margin-bottom: 40px;
}

.events-list {
  display: grid;
  gap: 24px;
}

.event-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  border: 1px solid var(--border-light);
}

.event-card h3 {
  margin: 0 0 10px;
  font-size: 1.4em;
  color: var(--text-dark);
}

.event-card p {
  margin: 0;
  color: var(--text-medium);
}

@media (max-width: 768px) {
  .page-container {
    padding: 18px 4px;
  }
  .page-title {
    font-size: 1.3em;
    margin-bottom: 3px;
  }
  .page-subtitle {
    font-size: 1em;
    margin-bottom: 14px;
  }
  .events-list {
    gap: 10px;
  }
  .event-card {
    padding: 14px 10px;
    border-radius: 10px;
  }
  .event-card h3 {
    font-size: 1.02em;
    margin-bottom: 4px;
  }
  .event-card p {
    font-size: 0.94em;
  }
}
</style>
