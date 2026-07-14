// GET /api/pages/[slug]/versions/[versionId] - get version blocks for preview (no changes to DB)
import { getFirestoreConfig, getAccessToken, getFirestoreDoc, parseFirestoreDoc } from '../../../../utils/firebase'
import { requireAdmin } from '../../../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const versionId = getRouterParam(event, 'versionId')

  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug manquant' })
  }
  if (!versionId) {
    throw createError({ statusCode: 400, message: 'Version ID manquant' })
  }

  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    const { getVersion } = await import('../../../../utils/firestore-mock.js')
    const versionData = getVersion(slug, versionId)
    if (!versionData?.blocks) {
      throw createError({ statusCode: 404, message: 'Version introuvable' })
    }
    return { success: true, blocks: versionData.blocks }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  await requireAdmin(event)

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)

    const versionDoc = await getFirestoreDoc(config.projectId, accessToken, 'pages', `${slug}/versions/${versionId}`)
    if (!versionDoc) {
      throw createError({ statusCode: 404, message: 'Version introuvable' })
    }

    const versionData = parseFirestoreDoc(versionDoc)
    if (!versionData?.blocks) {
      throw createError({ statusCode: 400, message: 'Version vide ou corrompue' })
    }

    return { success: true, blocks: versionData.blocks }
  } catch (err: any) {
    console.error('Get version error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors de la lecture de la version: ${err.message || err}` })
  }
})
