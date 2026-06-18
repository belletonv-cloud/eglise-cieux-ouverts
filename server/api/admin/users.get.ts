import { getFirestoreConfig, getAccessToken, getFirestoreDoc, parseFirestoreDoc } from '../../utils/firebase'
import { getAdminUids, verifyFirebaseToken } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const userInfo = await verifyFirebaseToken(authHeader.slice(7))
  if (!userInfo) {
    throw createError({ statusCode: 401, message: 'Token invalide' })
  }

  const uids = await getAdminUids(event)
  if (!uids.includes(userInfo.uid)) {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  return { uids }
})
