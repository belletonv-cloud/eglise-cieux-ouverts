import { getFirestoreConfig, getAccessToken, getFirestoreDoc, setFirestoreDoc } from '../../utils/firebase'
import { requireAdmin } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug manquant' })
  }

  const reservedSlugs = ['admin', 'api', '_nuxt', 'favicon.ico', 'robots.txt']
  if (reservedSlugs.includes(slug)) {
    throw createError({ statusCode: 400, message: 'Impossible de supprimer cette page' })
  }

  // En mode test, soft-delete dans le mock RAM — jamais dans la vraie base
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    const { getPageDoc, setPageDoc } = await import('../../utils/firestore-mock.js')
    const current = await getPageDoc(slug)
    await setPageDoc(slug, {
      ...current,
      _deleted: true,
      blocks: [],
      updatedAt: new Date().toISOString(),
      updatedBy: 'test',
    })
    return { success: true }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  const userInfo = await requireAdmin(event)

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)

    const doc = await getFirestoreDoc(config.projectId, accessToken, 'pages', slug)
    if (!doc) {
      throw createError({ statusCode: 404, message: 'Page introuvable' })
    }

    // updateMask : conserve title/createdAt pour une éventuelle restauration
    await setFirestoreDoc(config.projectId, accessToken, 'pages', slug, {
      _deleted: true,
      blocks: [],
      updatedAt: new Date().toISOString(),
      updatedBy: userInfo.email || 'inconnu',
    }, ['_deleted', 'blocks', 'updatedAt', 'updatedBy'])

    return { success: true }
  } catch (err: any) {
    console.error('Page delete error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors de la suppression: ${err.message || err}` })
  }
})
