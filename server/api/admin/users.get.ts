import { getFirestoreConfig, getAccessToken, getFirestoreDoc, parseFirestoreDoc } from '../../utils/firebase'
import { verifyFirebaseToken } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const userInfo = await verifyFirebaseToken(authHeader.slice(7))
  if (!userInfo) {
    throw createError({ statusCode: 401, message: 'Token invalide' })
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
  const doc = await getFirestoreDoc(config.projectId, accessToken, 'settings', 'admins')
  const parsed = doc ? parseFirestoreDoc(doc) : null
  const uids: string[] = parsed?.uids || []
  const emails: string[] = parsed?.emails || []

  if (uids.length === 0 && emails.length === 0) {
    throw createError({ statusCode: 404, message: 'Aucun administrateur configuré' })
  }

  const adminByUid = uids.includes(userInfo.uid)
  const adminByEmail = !!userInfo.email && emails.map(e => e.toLowerCase()).includes(userInfo.email.toLowerCase())
  if (!adminByUid && !adminByEmail) {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  return { emails, uids }
})
