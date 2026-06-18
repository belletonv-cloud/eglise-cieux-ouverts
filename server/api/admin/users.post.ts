import { getFirestoreConfig, getAccessToken, getFirestoreDoc, setFirestoreDoc, parseFirestoreDoc } from '../../utils/firebase'
import { verifyFirebaseToken } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const callerInfo = await verifyFirebaseToken(authHeader.slice(7))
  if (!callerInfo) {
    throw createError({ statusCode: 401, message: 'Token invalide' })
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  const body = await readBody(event)
  const newUid = body?.uid
  if (!newUid) {
    throw createError({ statusCode: 400, message: 'UID manquant' })
  }

  const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
  const doc = await getFirestoreDoc(config.projectId, accessToken, 'settings', 'admins')
  const parsed = doc ? parseFirestoreDoc(doc) : null
  const currentUids: string[] = parsed?.uids || []

  // Vérifier que l'appelant est déjà admin
  if (!currentUids.includes(callerInfo.uid)) {
    throw createError({ statusCode: 403, message: 'Seuls les admins peuvent gérer les comptes' })
  }

  if (currentUids.includes(newUid)) {
    return { success: true, message: 'Déjà admin' }
  }

  currentUids.push(newUid)
  await setFirestoreDoc(config.projectId, accessToken, 'settings', 'admins', {
    uids: currentUids,
    updatedAt: new Date().toISOString(),
    updatedBy: callerInfo.uid,
  })

  return { success: true, uids: currentUids }
})
