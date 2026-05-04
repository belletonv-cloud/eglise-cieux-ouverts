// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },

  app: {
    head: {
      title: 'Église Cieux Ouverts — Morlaix',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Église Cieux Ouverts à Morlaix, Bretagne. Culte chaque dimanche à 10h. Venez comme vous êtes.' },
        { property: 'og:title', content: 'Église Cieux Ouverts — Morlaix' },
        { property: 'og:description', content: 'Culte chaque dimanche à 10h. 2 rue Jean Monnet, 29600 Morlaix.' },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'icon', type: 'image/jpeg', href: '/favicon.jpg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap' }
      ]
    }
  },

  css: ['~/assets/style.css'],

  nitro: {
    preset: 'cloudflare-pages'
  },

  plugins: [
    '~/plugins/firebase.client.js'
  ]
})
