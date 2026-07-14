import { getFirestoreConfig, getAccessToken, setFirestoreDoc } from '../../utils/firebase'
import { requireAdmin } from '../../utils/firebase-admin'

// Permet uniquement de marquer un message lu/non lu — pas de réponse
// gérée depuis l'admin (mailto/reply hors scope, voir FEATURES.md).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Id manquant' })
  }
  const body = await readBody(event)
  const status = body?.status === 'read' ? 'read' : 'new'

  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    const { getContact, setContact } = await import('../../utils/firestore-mock.js')
    const current = getContact(id)
    if (!current) {
      throw createError({ statusCode: 404, message: 'Message introuvable' })
    }
    setContact(id, { ...current, status })
    return { success: true }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  await requireAdmin(event)

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    await setFirestoreDoc(config.projectId, accessToken, 'contacts', id, { status }, ['status'])
    return { success: true }
  } catch (err: any) {
    console.error('Contact update error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors de la mise à jour: ${err.message || err}` })
  }
})
