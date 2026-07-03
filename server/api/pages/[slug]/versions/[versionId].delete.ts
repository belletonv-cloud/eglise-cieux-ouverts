import { getFirestoreConfig, getAccessToken } from '../../../../utils/firebase'

export default defineEventHandler(async (event) => {
  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  const slug = getRouterParam(event, 'slug')
  const versionId = getRouterParam(event, 'versionId')
  if (!slug || !versionId) {
    throw createError({ statusCode: 400, message: 'Paramètres manquants' })
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/pages/${slug}/versions/${versionId}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${accessToken}` },
    })
    if (!response.ok && response.status !== 404) {
      throw new Error(`Firestore error ${response.status}: ${await response.text()}`)
    }
    return { success: true }
  } catch (err: any) {
    console.error('Version delete error:', err)
    throw createError({ statusCode: 500, message: `Erreur: ${err.message || err}` })
  }
})
