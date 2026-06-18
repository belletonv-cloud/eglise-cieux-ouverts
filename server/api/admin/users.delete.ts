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
  const targetUid = body?.uid
  if (!targetUid) {
    throw createError({ statusCode: 400, message: 'UID manquant' })
  }

  // Empêcher un admin de se retirer lui-même
  if (targetUid === callerInfo.uid) {
    throw createError({ statusCode: 400, message: 'Impossible de se retirer soi-même' })
  }

  const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
  const doc = await getFirestoreDoc(config.projectId, accessToken, 'settings', 'admins')
  const parsed = doc ? parseFirestoreDoc(doc) : null
  const currentUids: string[] = parsed?.uids || []

  if (!currentUids.includes(callerInfo.uid)) {
    throw createError({ statusCode: 403, message: 'Seuls les admins peuvent gérer les comptes' })
  }

  const updatedUids = currentUids.filter((u: string) => u !== targetUid)
  if (updatedUids.length === currentUids.length) {
    throw createError({ statusCode: 404, message: 'Utilisateur pas dans la liste admin' })
  }

  await setFirestoreDoc(config.projectId, accessToken, 'settings', 'admins', {
    uids: updatedUids,
    updatedAt: new Date().toISOString(),
    updatedBy: callerInfo.uid,
  })

  return { success: true, uids: updatedUids }
})
