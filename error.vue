<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">{{ statusCode }}</h1>
      <h2 class="error-title">{{ title }}</h2>
      <p class="error-message">{{ message }}</p>
      <div class="error-actions">
        <NuxtLink to="/" class="btn-error btn-primary">
          Retour à l'accueil
        </NuxtLink>
        <button v-if="statusCode === 404 && isAdminMode" class="btn-error btn-secondary" @click="goHomeAdmin">
          Mode édition
        </button>
        <NuxtLink to="/contact" class="btn-error btn-outline">
          Nous contacter
        </NuxtLink>
      </div>
      <div class="error-suggestions">
        <p>Pages utiles :</p>
        <div class="error-links">
          <NuxtLink to="/messages">Messages</NuxtLink>
          <NuxtLink to="/agenda">Agenda</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  statusCode: { type: Number, default: 404 },
  statusMessage: { type: String, default: '' },
})

const { isAdminMode } = useAdmin()

const errorMessages = {
  404: { title: 'Page introuvable', message: "La page que vous cherchez n'existe pas ou a été déplacée." },
  500: { title: 'Erreur serveur', message: "Désolé, une erreur inattendue s'est produite." },
  403: { title: 'Accès non autorisé', message: "Vous n'avez pas la permission d'accéder à cette page." },
}

const info = errorMessages[props.statusCode] || { title: 'Erreur', message: props.statusMessage || 'Une erreur est survenue.' }
const title = info.title
const message = info.message

useSeoMeta({
  title: `${info.title} — Église Cieux Ouverts`,
  description: info.message,
})

function goHomeAdmin() {
  window.location.replace('/?admin=true')
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #064886 0%, #d97777 100%);
  padding: 40px 20px;
}
.error-content {
  text-align: center;
  max-width: 500px;
  color: white;
}
.error-code {
  font-family: 'Playfair Display', serif;
  font-size: clamp(80px, 20vw, 160px);
  font-weight: 900;
  margin: 0;
  line-height: 1;
  opacity: 0.3;
}
.error-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(24px, 5vw, 36px);
  font-weight: 700;
  margin: 16px 0 8px;
}
.error-message {
  font-size: 1.1em;
  opacity: 0.85;
  margin-bottom: 32px;
  line-height: 1.6;
}
.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 40px;
}
.btn-error {
  padding: 12px 28px;
  border-radius: 50px;
  font-size: 1em;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-error:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}
.btn-primary {
  background: white;
  color: #064886;
}
.btn-secondary {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 1px solid rgba(255,255,255,0.4);
}
.btn-secondary:hover {
  background: rgba(255,255,255,0.3);
}
.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid white;
}
.btn-outline:hover {
  background: rgba(255,255,255,0.1);
}
.error-suggestions {
  opacity: 0.7;
  font-size: 0.9em;
}
.error-suggestions p {
  margin: 0 0 8px;
}
.error-links {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}
.error-links a {
  color: white;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.error-links a:hover {
  opacity: 1;
}
</style>
