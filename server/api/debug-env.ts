export default defineEventHandler((event) => {
  if (import.meta.dev === false) {
    throw createError({ statusCode: 404, message: 'Not found' })
  }
  const config = useRuntimeConfig(event)
  return {
    pw: process.env.PW_TEST,
    configTest: config.public?.TEST_ENV,
    hasProjectId: !!process.env.NUXT_FIREBASE_PROJECT_ID,
    hasClientEmail: !!process.env.NUXT_FIREBASE_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.NUXT_FIREBASE_PRIVATE_KEY,
    hasPw: !!process.env.PW_TEST,
    cfgProjectId: !!config.firebaseProjectId,
    cfgClientEmail: !!config.firebaseClientEmail,
    cfgPrivateKey: !!config.firebasePrivateKey,
    envKeys: Object.keys(process.env).filter(k => k.startsWith('NUXT_') || k.startsWith('PW_') || k.startsWith('CF_') || k.startsWith('CLOUDFLARE_') || k.startsWith('PAGES_'))
  }
})