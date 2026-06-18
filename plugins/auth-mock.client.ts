// /plugins/auth-mock.client.ts

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  if (!config.public?.TEST_ENV) return

  const fakeUser = {
    uid: 'cli-test',
    email: 'ci-admin@tests.fr',
    displayName: 'Admin CI',
    photoURL: 'https://robohash.org/fakeci.png?set=set4',
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
      callback(currentUser)
      return () => {} // unsubscribe
    },
  })
})
