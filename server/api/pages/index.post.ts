import { getFirestoreConfig, getAccessToken, setFirestoreDoc } from '../../utils/firebase'
import { verifyFirebaseToken, isUserAdmin } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }
  const userInfo = await verifyFirebaseToken(authHeader.slice(7))
  if (!userInfo) {
    throw createError({ statusCode: 401, message: 'Token invalide' })
  }
  if (!await isUserAdmin(event, userInfo.email)) {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  const body = await readBody(event)
  if (!body || !body.slug) {
    throw createError({ statusCode: 400, message: 'Slug manquant' })
  }

  const slug = String(body.slug).toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug invalide' })
  }

  const reservedSlugs = ['admin', 'api', '_nuxt', 'favicon.ico', 'robots.txt']
  if (reservedSlugs.includes(slug)) {
    throw createError({ statusCode: 400, message: 'Ce slug est réservé' })
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)

    await setFirestoreDoc(config.projectId, accessToken, 'pages', slug, {
      blocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: userInfo.email || 'inconnu',
    })

    return { success: true, slug }
  } catch (err: any) {
    console.error('Page create error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors de la création: ${err.message || err}` })
  }
})
