// Build-time sanity check: when running in CI / Pages environments, fail the
// build early if the public Firebase API key is missing. This prevents silent
// deployments where the client bundle can't initialize Firebase and causes
// a degraded production site.
const isCI = Boolean(process.env.CI || process.env.GITHUB_ACTIONS || process.env.PAGES_BRANCH || process.env.PAGES || process.env.CF_PAGES)
if (isCI && process.env.NODE_ENV === "production" && !process.env.NUXT_PUBLIC_FIREBASE_API_KEY) {
  throw new Error('Missing NUXT_PUBLIC_FIREBASE_API_KEY in environment. Please set NUXT_PUBLIC_FIREBASE_API_KEY in your Pages environment variables before deploying.')
}

export default defineNuxtConfig({
  css: ['~/assets/css/main.css', '~/assets/css/event-modal.css'],
  experimental: {
    appManifest: false
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  typescript: {
    typeCheck: false,
    strict: false,
    shim: false
  },
  components: [
    { path: '~/components', global: true },
    { path: '~/components/editor', global: true }
  ],
  // @ts-expect-error: 'nitro' is valid at runtime but not in Nuxt 3.20's InputConfig type
  nitro: {
    preset: process.env.PW_TEST === '1' ? 'node-server' : 'cloudflare-pages',
  },
  hooks: {
    'build:before': async () => {
      const { mkdirSync } = await import('node:fs')
      mkdirSync('.nuxt/dist/server', { recursive: true })
    }
  },
  watchers: {
    chokidar: {
      ignored: /(^|[/\\])\.opencode([/\\]|$)/
    }
  },
  vite: {
    server: { watch: { ignored: ['**/.opencode/**'] } }
  },
  runtimeConfig: {
    public: {
      TEST_ENV: !!process.env.PW_TEST,
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
