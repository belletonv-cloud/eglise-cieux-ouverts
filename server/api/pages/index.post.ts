import { getFirestoreConfig, getAccessToken, setFirestoreDoc } from '../../utils/firebase'
import { requireAdmin } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  const userInfo = await requireAdmin(event)

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

    const title = body.title?.trim() || slug

    await setFirestoreDoc(config.projectId, accessToken, 'pages', slug, {
      title,
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
