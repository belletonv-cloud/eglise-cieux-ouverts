// /plugins/auth-mock.client.ts

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  if (!config.TEST_ENV) return // Uses PW_TEST via runtimeConfig, set by Playwright automatically.

  const fakeUser = {
    uid: 'cli-test',
    email: 'ci-admin@tests.fr',
    displayName: 'Admin CI',
    photoURL: 'https://robohash.org/fakeci.png?set=set4',
  }

  nuxtApp.provide('auth', {
    currentUser: fakeUser,
  })
})
