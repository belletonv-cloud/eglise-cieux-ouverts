import { getFirestoreConfig, getAccessToken, getFirestoreDoc, setFirestoreDoc } from '../../utils/firebase'
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

  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug manquant' })
  }

  const reservedSlugs = ['admin', 'api', '_nuxt', 'favicon.ico', 'robots.txt']
  if (reservedSlugs.includes(slug)) {
    throw createError({ statusCode: 400, message: 'Impossible de supprimer cette page' })
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)

    const doc = await getFirestoreDoc(config.projectId, accessToken, 'pages', slug)
    if (!doc) {
      throw createError({ statusCode: 404, message: 'Page introuvable' })
    }

    await setFirestoreDoc(config.projectId, accessToken, 'pages', slug, {
      _deleted: true,
      blocks: [],
      updatedAt: new Date().toISOString(),
      updatedBy: userInfo.email || 'inconnu',
    })

    return { success: true }
  } catch (err: any) {
    console.error('Page delete error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors de la suppression: ${err.message || err}` })
  }
})
