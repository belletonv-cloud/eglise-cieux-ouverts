// /plugins/auth-mock.client.ts

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  if (!config.public?.TEST_ENV) return

  const fakeUser = {
    uid: 'cli-test',
    email: 'ci-admin@tests.fr',
    displayName: 'Admin CI',
    photoURL: 'https://robohash.org/fakeci.png?set=set4',
    // Un vrai User Firebase expose toujours getIdToken() ; sans ça, tout
    // appel client qui fait `if (!token) throw 'Non authentifié'` échoue
    // silencieusement en mode mock (aucun test n'exerçait ce chemin).
    getIdToken: async () => 'mock-test-token',
  }

  // Allow tests to override mock auth result via window.__MOCK_AUTH_RESULT.
  // Set to null to simulate unauthenticated state, or pass a custom user object.
  const mockResult =
    typeof window !== 'undefined' && '__MOCK_AUTH_RESULT' in window
      ? (window as Record<string, unknown>).__MOCK_AUTH_RESULT
      : undefined

  const currentUser = mockResult === undefined ? fakeUser : (mockResult as typeof fakeUser | null)

  nuxtApp.provide('auth', {
    currentUser,
    onAuthStateChanged: (callback: (u: typeof fakeUser | null) => void) => {
      // Firebase n'appelle jamais ce callback de façon synchrone (même avec
      // une session en cache, il arrive au plus tôt sur un microtask) — le
      // composant a donc toujours fini son render initial avant. Un appel
      // synchrone ici change `user` avant l'hydratation et provoque un faux
      // mismatch SSR/client (ex: libellé "Espace membre" vs "👤 Admin").
      queueMicrotask(() => callback(currentUser))
      return () => {} // unsubscribe
    },
  })
})
