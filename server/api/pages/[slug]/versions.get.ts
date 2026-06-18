import { getFirestoreConfig, getAccessToken, getFirestoreDoc, parseFirestoreDoc } from '../../../utils/firebase'

export default defineEventHandler(async (event) => {
  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug manquant' })
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)

    // Lire tous les documents dans la sous-collection versions
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

    const versions = documents.map((doc: any) => {
      const id = doc.name.split('/').pop()
      const parsed = parseFirestoreDoc(doc)
      return {
        id,
        savedAt: parsed?.savedAt || null,
        savedBy: parsed?.savedBy || 'inconnu',
      }
    })

    // Trier du plus récent au plus ancien
    versions.sort((a: any, b: any) => {
      if (!a.savedAt) return 1
      if (!b.savedAt) return -1
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    })

    return { versions }
  } catch (err: any) {
    console.error('Versions list error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors du chargement des versions: ${err.message || err}` })
  }
})
