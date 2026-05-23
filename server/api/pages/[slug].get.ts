export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const projectId = process.env.NUXT_FIREBASE_PROJECT_ID || config.firebaseProjectId
  const clientEmail = process.env.NUXT_FIREBASE_CLIENT_EMAIL || config.firebaseClientEmail
  const privateKey = process.env.NUXT_FIREBASE_PRIVATE_KEY || config.firebasePrivateKey

  if (!projectId || !clientEmail || !privateKey) {
    // In development or environments where Firebase is not configured,
    // do not fail the whole SSR: return a safe fallback so pages can render.
    // Keep a server-side log to help the developer notice the missing config.
    console.warn('Firestore configuration incomplete. Returning fallback { blocks: null } for page API.')
    return { blocks: null }
  }

  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug manquant.' })
  }

  try {
    const accessToken = await getAccessToken(clientEmail, privateKey)
    const doc = await getFirestoreDoc(projectId, accessToken, 'pages', slug)

    if (!doc) {
      return { blocks: null }
    }

    const parsed = parseFirestoreDoc(doc)
    return { blocks: parsed?.blocks || null }
  } catch (err) {
    console.error('Page API error:', err)
    throw createError({ statusCode: 500, message: 'Erreur lors du chargement de la page.' })
  }
})
