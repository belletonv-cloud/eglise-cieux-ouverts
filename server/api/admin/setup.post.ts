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

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const doc = await getFirestoreDoc(config.projectId, accessToken, 'settings', 'admins')
    const parsed = doc ? parseFirestoreDoc(doc) : null
    const currentUids: string[] = parsed?.uids || []

    if (currentUids.length > 0) {
      throw createError({ statusCode: 400, message: 'Des admins existent déjà. Utilisez la gestion des admins.' })
    }

    await setFirestoreDoc(config.projectId, accessToken, 'settings', 'admins', {
      uids: [userInfo.uid],
      updatedAt: new Date().toISOString(),
      updatedBy: userInfo.uid,
    })

    return { success: true, message: 'Premier admin créé' }
  } catch (e: any) {
    console.error('setup error:', e?.message || e?.toString() || e)
    throw createError({ statusCode: 500, message: e?.message || 'Erreur interne' })
  }
})
