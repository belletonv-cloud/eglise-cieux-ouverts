<template>
  <div class="admin-redirect-page">
    <div class="admin-redirect-card">
      <div class="spinner"></div>
      <h2>Mode édition</h2>
      <p>Redirection vers l'éditeur inline...</p>
    </div>
  </div>
</template>

<script setup>
onMounted(() => {
  window.location.replace('/?admin=true')
})
</script>

<style scoped>
.admin-redirect-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}
.admin-redirect-card {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.admin-redirect-card h2 {
  font-family: 'Playfair Display', serif;
  color: #064886;
  margin: 16px 0 8px;
}
.admin-redirect-card p {
  color: #888;
  font-size: 0.9em;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-top-color: #064886;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
