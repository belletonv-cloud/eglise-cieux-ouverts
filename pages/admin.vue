<template>
  <div class="admin-info-page">
    <div class="admin-info-card">
      <h1>Administration du site</h1>
      <p class="admin-info-subtitle">Église Cieux Ouverts — Morlaix</p>

      <div class="admin-info-steps">
        <div class="admin-step">
          <span class="step-number">1</span>
          <div class="step-content">
            <h3>Activer le mode édition</h3>
            <p>Ajoutez <code>?admin=true</code> à la fin de l'URL de n'importe quelle page :</p>
            <div class="url-examples">
              <code class="url-code">/?admin=true</code>
              <code class="url-code">/contact?admin=true</code>
              <code class="url-code">/messages?admin=true</code>
            </div>
          </div>
        </div>

        <div class="admin-step">
          <span class="step-number">2</span>
          <div class="step-content">
            <h3>Modifier un bloc</h3>
            <p>Cliquez sur n'importe quel bloc de la page. Un panneau d'édition apparaît à droite.</p>
          </div>
        </div>

        <div class="admin-step">
          <span class="step-number">3</span>
          <div class="step-content">
            <h3>Modifier les propriétés</h3>
            <p>Changez les textes, couleurs, images, animations... Les modifications sont visibles en temps réel.</p>
          </div>
        </div>

        <div class="admin-step">
          <span class="step-number">4</span>
          <div class="step-content">
            <h3>Sauvegarder</h3>
            <p>Cliquez sur <strong>"Sauvegarder"</strong> dans la barre d'outils. Vous devez être connecté avec Google.</p>
          </div>
        </div>
      </div>

      <div class="admin-info-actions">
        <NuxtLink to="/?admin=true" class="btn-admin btn-primary">
          Ouvrir l'éditeur →
        </NuxtLink>
      </div>

      <div class="admin-info-shortcuts">
        <h3>Accès rapide</h3>
        <div class="shortcut-links">
          <NuxtLink to="/?admin=true">Accueil</NuxtLink>
          <NuxtLink to="/contact?admin=true">Contact</NuxtLink>
          <NuxtLink to="/messages?admin=true">Messages</NuxtLink>
          <NuxtLink to="/photos?admin=true">Photos</NuxtLink>
          <NuxtLink to="/billetterie?admin=true">Billetterie</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Administration — Église Cieux Ouverts',
  description: 'Guide d\'administration du site de l\'Église Cieux Ouverts.',
})
</script>

<style scoped>
.admin-info-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #064886 0%, #d97777 100%);
  padding: 40px 20px;
}
.admin-info-card {
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.15);
  color: #1a1a2e;
}
.admin-info-card h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(24px, 5vw, 32px);
  color: #064886;
  margin: 0 0 4px;
  text-align: center;
}
.admin-info-subtitle {
  text-align: center;
  color: #888;
  font-size: 0.9em;
  margin: 0 0 32px;
}
.admin-info-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
}
.admin-step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.step-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #064886;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9em;
}
.step-content h3 {
  margin: 0 0 4px;
  font-size: 1em;
  color: #1a1a2e;
}
.step-content p {
  margin: 0;
  font-size: 0.88em;
  color: #555;
  line-height: 1.5;
}
.step-content code {
  background: #f0f0f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  color: #064886;
}
.url-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.url-code {
  background: #f0f0f5;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85em;
  color: #064886;
  font-family: monospace;
}
.admin-info-actions {
  text-align: center;
  margin-bottom: 32px;
}
.btn-admin {
  display: inline-block;
  padding: 14px 32px;
  border-radius: 50px;
  font-size: 1em;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  border: none;
  cursor: pointer;
}
.btn-admin:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}
.btn-primary {
  background: #064886;
  color: white;
}
.admin-info-shortcuts {
  border-top: 1px solid #eee;
  padding-top: 24px;
  text-align: center;
}
.admin-info-shortcuts h3 {
  margin: 0 0 12px;
  font-size: 0.9em;
  color: #888;
  font-weight: 600;
}
.shortcut-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}
.shortcut-links a {
  color: #064886;
  text-decoration: none;
  font-size: 0.88em;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 6px;
  background: #f0f4ff;
  transition: background 0.2s;
}
.shortcut-links a:hover {
  background: #e0e8ff;
}
</style>
