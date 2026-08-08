import { getFirestoreConfig, getAccessToken } from '../../utils/firebase'
import { requireAdmin } from '../../utils/firebase-admin'
import { fetchWithTimeout } from '../../utils/http'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Id manquant' })
  }

  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    const { deleteComment } = await import('../../utils/firestore-mock.js')
    deleteComment(id)
    return { success: true }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  await requireAdmin(event)

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/comments/${id}`
    const response = await fetchWithTimeout(url, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${accessToken}` },
    })
    if (!response.ok && response.status !== 404) {
      throw new Error(`Firestore error ${response.status}: ${await response.text()}`)
    }
    return { success: true }
  } catch (err: any) {
    console.error('Comment delete error:', err)
    throw createError({ statusCode: 500, message: `Erreur: ${err.message || err}` })
  }
})
