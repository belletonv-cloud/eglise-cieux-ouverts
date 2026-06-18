import { getFirestoreConfig, getAccessToken, getFirestoreDoc, setFirestoreDoc, parseFirestoreDoc } from '../../utils/firebase'
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
  const currentUids: string[] = parsed?.uids || []

  // Ne fonctionne que s'il n'y a pas encore d'admin
  if (currentUids.length > 0) {
    throw createError({ statusCode: 400, message: 'Des admins existent déjà. Utilisez la gestion des admins.' })
  }

  await setFirestoreDoc(config.projectId, accessToken, 'settings', 'admins', {
    uids: [userInfo.uid],
    updatedAt: new Date().toISOString(),
    updatedBy: userInfo.uid,
  })

  return { success: true, message: 'Premier admin créé' }
})
