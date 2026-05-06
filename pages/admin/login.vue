<template>
  <div class="login-page">
    <div class="login-card">
      <img src="/logo.png" alt="Cieux Ouverts" class="login-logo" />
      <h1 class="login-title">Administration</h1>
      <p class="login-sub">Église Cieux Ouverts</p>

      <form @submit.prevent="login" class="login-form">
        <div class="field">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="admin@cieuxouverts.bzh"
            autocomplete="email"
            required
          />
        </div>
        <div class="field">
          <label>Mot de passe</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </div>
        <p v-if="error" class="login-error">{{ error }}</p>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const { $auth } = useNuxtApp()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

// Si déjà connecté, rediriger vers admin
onMounted(() => {
  const { onAuthStateChanged } = require('firebase/auth')
  onAuthStateChanged($auth, (user) => {
    if (user) router.replace('/admin')
  })
})

async function login() {
  error.value = ''
  loading.value = true
  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth')
    await signInWithEmailAndPassword($auth, email.value, password.value)
    router.replace('/admin')
  } catch (e) {
    error.value = e.code === 'auth/invalid-credential'
      ? 'Email ou mot de passe incorrect.'
      : 'Erreur : ' + e.message
  }
  loading.value = false
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #0f0f1a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Helvetica, Arial, sans-serif;
}

.login-card {
  background: #1e1e2e;
  border: 1px solid #2d2d3f;
  border-radius: 16px;
  padding: 48px 40px;
  width: 380px;
  max-width: 95vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.login-logo {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
  margin-bottom: 8px;
}

.login-title {
  font-size: 1.3em;
  font-weight: 700;
  color: white;
  margin: 0;
}

.login-sub {
  font-size: 0.85em;
  color: #7c7c9a;
  margin: 0 0 16px;
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 0.78em;
  color: #9999bb;
  font-weight: 500;
}

.field input {
  background: #2d2d3f;
  border: 1px solid #3d3d55;
  border-radius: 8px;
  color: #e2e8f0;
  padding: 10px 14px;
  font-size: 0.95em;
  outline: none;
  transition: border-color 0.15s;
}
.field input:focus { border-color: #064886; }

.login-error {
  background: rgba(239,75,84,0.1);
  border: 1px solid rgba(239,75,84,0.3);
  border-radius: 8px;
  color: #EF4B54;
  font-size: 0.84em;
  padding: 10px 14px;
  margin: 0;
  text-align: center;
}

.login-btn {
  background: #064886;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.95em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 4px;
}
.login-btn:hover { background: #0a60b8; }
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
