<template>
  <div class="admin-login-page">
    <div class="admin-login-card">
      <img src="/logo-nav.png" alt="Cieux Ouverts" class="admin-login-logo" />
      <h1>Administration</h1>

      <div v-if="error" class="admin-login-actions">
        <p class="admin-error">{{ error }}</p>
        <button class="btn-admin" @click="signOut">Se déconnecter</button>
      </div>

      <template v-else-if="!checking">
        <div v-if="user && !isAdmin && !isSetupMode" class="admin-login-actions">
          <p class="admin-error">Vous n'êtes pas autorisé à accéder à l'administration.</p>
          <button class="btn-admin" @click="signOut">Se déconnecter</button>
        </div>

        <div v-else-if="isSetupMode" class="admin-login-actions">
          <p class="admin-login-subtitle">Aucun administrateur configuré.</p>
          <button class="btn-admin" @click="setupFirstAdmin" :disabled="settingUp">
            {{ settingUp ? 'Configuration...' : 'Configurer l\'administration' }}
          </button>
        </div>

        <div v-else class="admin-login-actions">
          <p class="admin-login-subtitle">Connectez-vous pour modifier le site</p>
          <button v-if="!user" class="btn-google" @click="signIn">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Se connecter avec Google
          </button>
          <button v-else class="btn-admin" @click="goAdmin">
            Accéder à l'éditeur →
          </button>
        </div>
      </template>

      <div v-else class="admin-checking">
        <span class="spinner"></span>
        Vérification de l'authentification...
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'

useSeoMeta({
  title: 'Administration — Église Cieux Ouverts',
  description: 'Connexion à l\'administration du site.',
})

const route = useRoute()
const { $auth } = useNuxtApp()
const router = useRouter()
const user = ref(null)
const checking = ref(true)
const isAdmin = ref(false)
const isSetupMode = ref(false)
const error = ref('')
const settingUp = ref(false)

const redirectUrl = computed(() => route.query.redirect || '/?admin=true')

onMounted(() => {
  if (!$auth?.onAuthStateChanged) {
    checking.value = false
    return
  }
  $auth.onAuthStateChanged(async (u) => {
    user.value = u
    error.value = ''
    if (!u) {
      checking.value = false
      return
    }
    // Vérifier si l'utilisateur est admin
    try {
      const config = useRuntimeConfig()
      if (config.public?.TEST_ENV) {
        isAdmin.value = true
        isSetupMode.value = false
        checking.value = false
        navigateTo(redirectUrl.value, { replace: true })
        return
      }
      const token = await u.getIdToken()
      const res = await fetch('/api/admin/check', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.isAdmin) {
        isAdmin.value = true
        isSetupMode.value = false
        checking.value = false
        navigateTo(redirectUrl.value, { replace: true })
        return
      }
      // Si setupMode pas dans la réponse (ancien déploiement),
      // on teste /api/admin/users : 404 = aucun admin configuré
      if (data.setupMode === true || data.setupMode === undefined) {
        try {
          const usersRes = await fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          // 404 = pas d'admin du tout, 403 = admin existe mais pas nous
          isSetupMode.value = usersRes.status === 404
        } catch {
          isSetupMode.value = true
        }
      } else {
        isSetupMode.value = false
      }
      isAdmin.value = false
      checking.value = false
    } catch {
      isAdmin.value = false
      isSetupMode.value = false
      checking.value = false
    }
  })
})

async function signIn() {
  try {
    const provider = new GoogleAuthProvider()
    await signInWithPopup($auth, provider)
  } catch (e) {
    if (e.code !== 'auth/popup-closed-by-user') {
      console.error('Login error:', e)
    }
  }
}

async function signOut() {
  try {
    await firebaseSignOut($auth)
  } catch (e) {
    console.error('Sign out error:', e)
  }
}

async function setupFirstAdmin() {
  settingUp.value = true
  try {
    const token = await user.value?.getIdToken()
    if (!token) throw new Error('Non authentifié')
    const res = await fetch('/api/admin/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
    isAdmin.value = true
    isSetupMode.value = false
    navigateTo(redirectUrl.value, { replace: true })
  } catch (e) {
    error.value = e.message || 'Erreur de configuration'
  } finally {
    settingUp.value = false
  }
}

function goAdmin() {
  try {
    navigateTo(redirectUrl.value, { replace: true })
  } catch (e) {
    console.error('[admin] navigateTo failed, falling back to router.replace', e)
    try {
      router.replace(redirectUrl.value)
    } catch (e2) {
      console.error('[admin] router.replace also failed, using window.location', e2)
      window.location.href = redirectUrl.value
    }
  }
}
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #064886 0%, #d97777 100%);
  padding: 40px 20px;
}
.admin-login-card {
  max-width: 420px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 48px 32px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.15);
  text-align: center;
}
.admin-login-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 16px;
}
.admin-login-card h1 {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  color: #064886;
  margin: 0 0 4px;
}
.admin-login-subtitle {
  color: #888;
  font-size: 0.9em;
  margin: 0 0 32px;
}
.admin-error {
  color: #d32f2f;
  font-size: 0.9em;
  margin: 16px 0;
}
.admin-login-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}
.btn-google {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 28px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #444;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.btn-google:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
.btn-admin {
  display: inline-block;
  padding: 14px 32px;
  background: #064886;
  color: white;
  border-radius: 50px;
  font-size: 1em;
  font-weight: 700;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}
.btn-admin:hover {
  transform: translateY(-2px);
}
.admin-checking {
  color: #888;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-top-color: #064886;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
