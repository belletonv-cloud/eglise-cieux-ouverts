export default defineEventHandler(async (event) => {
  return {
    projectId: process.env.NUXT_FIREBASE_PROJECT_ID || 'MISSING',
    clientEmail: process.env.NUXT_FIREBASE_CLIENT_EMAIL || 'MISSING',
    privateKeyLength: process.env.NUXT_FIREBASE_PRIVATE_KEY?.length || 0,
    privateKeyStart: process.env.NUXT_FIREBASE_PRIVATE_KEY?.substring?.(0, 40) || 'MISSING',
    privateKeyHasNewlines: process.env.NUXT_FIREBASE_PRIVATE_KEY?.includes?.('\n') || false,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('FIREBASE') || k.includes('NUXT')),
  }
})
