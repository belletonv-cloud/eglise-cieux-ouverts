<template>
  <div class="login-page">
    <div class="login-card">
      <img src="/logo.png" alt="Cieux Ouverts" class="login-logo" />
      <h1 class="login-title">Administration</h1>
      <p class="login-sub">Église Cieux Ouverts</p>

      <p v-if="error" class="login-error">{{ error }}</p>

      <button class="google-btn" :disabled="loading" @click="loginWithGoogle">
        <svg class="google-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        {{ loading ? 'Connexion...' : 'Se connecter avec Google' }}
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const { $auth } = useNuxtApp()
const router = useRouter()

const error = ref('')
const loading = ref(false)

onMounted(async () => {
  const { onAuthStateChanged } = await import('firebase/auth')
  onAuthStateChanged($auth, (user) => {
    if (user) router.replace('/admin')
  })
})

async function loginWithGoogle() {
  error.value = ''
  loading.value = true
  try {
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
    const provider = new GoogleAuthProvider()
    await signInWithPopup($auth, provider)
    router.replace('/admin')
  } catch (e) {
    if (e.code !== 'auth/popup-closed-by-user') {
      error.value = 'Erreur de connexion : ' + e.message
    }
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
  margin: 0 0 24px;
}

.login-error {
  background: rgba(239,75,84,0.1);
  border: 1px solid rgba(239,75,84,0.3);
  border-radius: 8px;
  color: #EF4B54;
  font-size: 0.84em;
  padding: 10px 14px;
  margin: 0 0 8px;
  text-align: center;
  width: 100%;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 12px 20px;
  background: white;
  color: #3c3c3c;
  border: none;
  border-radius: 8px;
  font-size: 0.95em;
  font-weight: 600;
  cursor: pointer;
  transition: box-shadow 0.15s, opacity 0.15s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.google-btn:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.4); }
.google-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.google-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
</style>
