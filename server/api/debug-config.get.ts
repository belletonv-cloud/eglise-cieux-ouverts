export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  return {
    hasProjectId: !!config.firebaseProjectId,
    hasClientEmail: !!config.firebaseClientEmail,
    hasPrivateKey: !!config.firebasePrivateKey,
    projectIdLength: config.firebaseProjectId?.length || 0,
    clientEmailLength: config.firebaseClientEmail?.length || 0,
    privateKeyLength: config.firebasePrivateKey?.length || 0,
    nodeEnv: process.env.NODE_ENV,
  }
})
