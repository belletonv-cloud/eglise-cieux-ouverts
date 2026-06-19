import { getFirestoreConfig, getAccessToken, getFirestoreDoc, parseFirestoreDoc } from '../../utils/firebase'
import { verifyFirebaseToken, getAdminEmails } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const userInfo = await verifyFirebaseToken(authHeader.slice(7))
  if (!userInfo) {
    throw createError({ statusCode: 401, message: 'Token invalide' })
  }

  const emails = await getAdminEmails(event)

  if (emails.length === 0) {
    throw createError({ statusCode: 404, message: 'Aucun administrateur configuré' })
  }

  const isAdmin = !!(userInfo.email && emails.map(e => e.toLowerCase()).includes(userInfo.email.toLowerCase()))
  if (!isAdmin) {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  return { emails }
})
