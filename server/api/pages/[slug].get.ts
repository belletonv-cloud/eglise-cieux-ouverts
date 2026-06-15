export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const projectId = (process.env.NUXT_FIREBASE_PROJECT_ID || config.firebaseProjectId) as string
  const clientEmail = (process.env.NUXT_FIREBASE_CLIENT_EMAIL || config.firebaseClientEmail) as string
  const privateKey = (process.env.NUXT_FIREBASE_PRIVATE_KEY || config.firebasePrivateKey) as string

  if (!projectId || !clientEmail || !privateKey) {
    // En CI, TEST_ENV ou local : renvoie la RAM du mock si Firestore absent
    const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
    if (isTest) {
      const { getPageDoc } = await import('../../utils/firestore-mock.js')
      const slug = getRouterParam(event, 'slug') || 'accueil'
      return await getPageDoc(slug)
    }
    // Sinon, fallback neutre → le frontend utilise getDefaultHomePage() etc.
    return { blocks: [] }
  }

  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug manquant.' })
  }

  try {
    const accessToken = await getAccessToken(clientEmail, privateKey)
    const doc = await getFirestoreDoc(projectId, accessToken, 'pages', slug)

    if (!doc) {
      // Jamais de null pour blocks ! ⇒ fallback neutre, UI toujours fonctionnelle
      return { blocks: [] }
    }

    const parsed = parseFirestoreDoc(doc)
    return { blocks: parsed?.blocks || null }
  } catch (err) {
    console.error('Page API error:', err)
    throw createError({ statusCode: 500, message: 'Erreur lors du chargement de la page.' })
  }
})
