import { ref, computed } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
} from 'firebase/auth'

// État singleton module-scope (même pattern que useAdmin.js — pas de useState).
const user = ref<any>(null)
const profile = ref<any>(null) // réponse de GET /api/member/me
const authReady = ref(false)
const profileLoading = ref(false)
let initialized = false

export function useMemberAuth() {
  const { $auth } = useNuxtApp() as any

  function init() {
    if (initialized || !$auth) return
    initialized = true
    // $auth.onAuthStateChanged existe aussi sur le mock de test (auth-mock.client.ts)
    $auth.onAuthStateChanged((u: any) => {
      user.value = u
      authReady.value = true
      if (u) fetchProfile()
      else profile.value = null
    })
  }

  async function getToken(): Promise<string | null> {
    if (!user.value?.getIdToken) return null
    try {
      return await user.value.getIdToken()
    } catch {
      return null
    }
  }

  async function authedFetch(path: string, options: any = {}) {
    const token = await getToken()
    if (!token) throw new Error('Non authentifié')
    return $fetch(path, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
    })
  }

  async function fetchProfile() {
    if (profileLoading.value) return
    profileLoading.value = true
    try {
      profile.value = await authedFetch('/api/member/me')
    } catch (e) {
      console.warn('useMemberAuth: fetchProfile failed', e)
      profile.value = null
    } finally {
      profileLoading.value = false
    }
  }

  async function loginEmail(email: string, password: string) {
    await signInWithEmailAndPassword($auth, email, password)
  }

  async function registerEmail(email: string, password: string) {
    await createUserWithEmailAndPassword($auth, email, password)
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail($auth, email)
  }

  async function logout() {
    // try/catch : le $auth mocké des tests n'est pas une vraie instance Firebase
    try {
      await firebaseSignOut($auth)
    } catch {
      /* mode test */
    }
    user.value = null
    profile.value = null
  }

  init()

  return {
    user,
    profile,
    authReady,
    profileLoading,
    isLoggedIn: computed(() => !!user.value),
    firstName: computed(() => profile.value?.member?.first_name || user.value?.displayName?.split(' ')[0] || ''),
    getToken,
    authedFetch,
    fetchProfile,
    loginEmail,
    registerEmail,
    resetPassword,
    logout,
  }
}
