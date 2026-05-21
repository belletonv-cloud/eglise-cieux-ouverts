export default defineNuxtConfig({
  nitro: {
    preset: 'cloudflare-pages'
  },
  typescript: {
    typeCheck: false,
    strict: false,
    shim: false,
    noImplicitAny: false
  },
  components: [
    { path: '~/components', global: true },
    { path: '~/components/editor', global: true }
  ],
  runtimeConfig: {
    public: {
      FIREBASE_API_KEY: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      apiUrl: process.env.PUBLIC_API_URL || process.env.NUXT_PUBLIC_API_URL
    }
  }
})
