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
    const missing: string[] = []
    const cfg = useRuntimeConfig(event)
    if (!cfg.firebaseProjectId && !process.env.NUXT_FIREBASE_PROJECT_ID) missing.push('projectId')
    if (!cfg.firebaseClientEmail && !process.env.NUXT_FIREBASE_CLIENT_EMAIL) missing.push('clientEmail')
    if (!cfg.firebasePrivateKey && !process.env.NUXT_FIREBASE_PRIVATE_KEY) missing.push('privateKey')
    console.error('setup error: config vars missing:', missing, 'runtimeConfig keys:', Object.keys(cfg))
    throw createError({ statusCode: 500, message: 'Firestore non configuré. Vérifier que les variables NUXT_FIREBASE_* sont définies.' })
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const doc = await getFirestoreDoc(config.projectId, accessToken, 'settings', 'admins')
    const parsed = doc ? parseFirestoreDoc(doc) : null
    const currentEmails: string[] = parsed?.emails || []

    if (currentEmails.length > 0) {
      throw createError({ statusCode: 400, message: 'Des admins existent déjà. Utilisez la gestion des admins.' })
    }

    if (!userInfo.email) {
      throw createError({ statusCode: 400, message: 'Aucun email associé à ce compte Google' })
    }

    await setFirestoreDoc(config.projectId, accessToken, 'settings', 'admins', {
      emails: [userInfo.email.toLowerCase()],
      updatedAt: new Date().toISOString(),
      updatedBy: userInfo.uid,
    })

    return { success: true, message: 'Premier admin créé' }
  } catch (e: any) {
    console.error('setup error:', e?.message || e?.toString() || e)
    throw createError({ statusCode: 500, message: e?.message || 'Erreur interne' })
  }
})
