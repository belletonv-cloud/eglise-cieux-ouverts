// /plugins/auth-mock.client.ts

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  if (!config.TEST_ENV) return

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
