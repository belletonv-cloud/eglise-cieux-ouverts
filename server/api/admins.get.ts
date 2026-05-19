// GET — liste les admins autorisés
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const projectId = process.env.NUXT_FIREBASE_PROJECT_ID || config.firebaseProjectId
  const clientEmail = process.env.NUXT_FIREBASE_CLIENT_EMAIL || config.firebaseClientEmail
  const privateKey = process.env.NUXT_FIREBASE_PRIVATE_KEY || config.firebasePrivateKey

  if (!projectId || !clientEmail || !privateKey) {
    throw createError({ statusCode: 503, statusMessage: 'Configuration Firestore incomplète.' })
  }

  try {
    const { getAccessToken, getFirestoreDoc, parseFirestoreDoc } = await import('../utils/firebase')
    const accessToken = await getAccessToken(clientEmail, privateKey)
    const doc = await getFirestoreDoc(accessToken, projectId, 'config', 'admins')

    if (!doc || !doc.fields) {
      return { admins: [] }
    }

    const parsed = parseFirestoreDoc(doc)
    return { admins: parsed?.emails || [] }
  } catch (err) {
    console.error('Admins list error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors du chargement des admins.' })
  }
})
