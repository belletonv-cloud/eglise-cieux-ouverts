export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  return {
    hasProjectId: !!config.firebaseProjectId,
    hasClientEmail: !!config.firebaseClientEmail,
    hasPrivateKey: !!config.firebasePrivateKey,
    projectIdLength: config.firebaseProjectId?.length || 0,
    clientEmailLength: config.firebaseClientEmail?.length || 0,
    privateKeyLength: config.firebasePrivateKey?.length || 0,
    privateKeyStart: config.firebasePrivateKey?.substring?.(0, 30) || 'N/A',
    privateKeyHasNewlines: config.firebasePrivateKey?.includes?.('\n') || false,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('FIREBASE') || k.includes('NUXT')),
  }
})
