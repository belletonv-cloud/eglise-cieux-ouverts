import { getFirestoreConfig, getAccessToken } from '../../../../utils/firebase'
import { requireAdmin } from '../../../../utils/firebase-admin'
import { fetchWithTimeout } from '../../../../utils/http'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const versionId = getRouterParam(event, 'versionId')
  if (!slug || !versionId) {
    throw createError({ statusCode: 400, message: 'Paramètres manquants' })
  }

  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    const { deleteVersionMock } = await import('../../../../utils/firestore-mock.js')
    deleteVersionMock(slug, versionId)
    return { success: true }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  await requireAdmin(event)

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/pages/${slug}/versions/${versionId}`
    const response = await fetchWithTimeout(url, {
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
