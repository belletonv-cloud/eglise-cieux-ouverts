export default defineEventHandler(async (event) => {
  return {
    hasResendKey: !!process.env.NUXT_RESEND_API_KEY,
    hasProjectId: !!process.env.NUXT_FIREBASE_PROJECT_ID,
    hasClientEmail: !!process.env.NUXT_FIREBASE_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.NUXT_FIREBASE_PRIVATE_KEY,
    resendKeyStart: process.env.NUXT_RESEND_API_KEY?.substring?.(0, 10) || 'MISSING',
    envKeys: Object.keys(process.env).filter(k => k.includes('NUXT')),
  }
})
