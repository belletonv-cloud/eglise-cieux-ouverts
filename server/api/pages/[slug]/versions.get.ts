import { getFirestoreConfig, getAccessToken, parseFirestoreDoc } from '../../../utils/firebase'
import { requireAdmin } from '../../../utils/firebase-admin'
import { buildVersionsResponse } from '../../../utils/version-diff.js'

export default defineEventHandler(async (event) => {
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    const slug = getRouterParam(event, 'slug')
    if (!slug) {
      throw createError({ statusCode: 400, message: 'Slug manquant' })
    }
    const { getVersionsRaw } = await import('../../../utils/firestore-mock.js')
    const versions = buildVersionsResponse(getVersionsRaw(slug))
    return { versions }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  await requireAdmin(event)

  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug manquant' })
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)

    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/pages/${slug}/versions`
    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) return { versions: [] }
      throw new Error(`Firestore error: ${await response.text()}`)
    }

    const data = await response.json()
    const documents = data.documents || []

    // Parse all versions, keeping blocks for diff computation
    const parsed = documents.map((doc: any) => {
      const id = doc.name.split('/').pop()
      const p = parseFirestoreDoc(doc)
      return {
        id,
        savedAt: p?.savedAt || null,
        savedBy: p?.savedBy || 'inconnu',
        blocks: p?.blocks || [],
      }
    })

    return { versions: buildVersionsResponse(parsed) }
  } catch (err: any) {
    console.error('Versions list error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors du chargement des versions: ${err.message || err}` })
  }
})
