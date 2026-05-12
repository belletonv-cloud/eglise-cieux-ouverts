// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: true,
  runtimeConfig: {
    firebaseProjectId: process.env.NUXT_FIREBASE_PROJECT_ID || '',
    firebaseClientEmail: process.env.NUXT_FIREBASE_CLIENT_EMAIL || '',
    firebasePrivateKey: process.env.NUXT_FIREBASE_PRIVATE_KEY || '',
    resendApiKey: process.env.NUXT_RESEND_API_KEY || '',
  },
  app: {
    head: {
      title: 'Église Cieux Ouverts — Morlaix',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/jpeg', href: '/favicon.jpg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;700;800&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&display=swap' }
      ],

    }
  },
  css: [
    '~/assets/css/main.css'
  ],
  nitro: {
    preset: 'cloudflare-pages'
  }
})
