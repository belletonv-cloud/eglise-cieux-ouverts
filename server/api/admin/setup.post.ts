import { getFirestoreConfig, getAccessToken, setFirestoreDoc } from '../../utils/firebase'
import { verifyFirebaseToken, lireAdminUsers } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const userInfo = await verifyFirebaseToken(authHeader.slice(7), event)
  if (!userInfo) {
    throw createError({ statusCode: 401, message: 'Token invalide' })
  }
  if (!userInfo.email) {
    throw createError({ statusCode: 400, message: 'Aucun email associé à ce compte' })
  }

  // Une liste vide n'autorise le bootstrap que si elle a réellement été lue :
  // sur une lecture en échec, la liste est vide elle aussi, et poursuivre
  // reviendrait à donner le rôle admin complet au premier compte connecté
  // venu, en écrasant la vraie liste d'administrateurs.
  const { users: currentUsers, lectureOk } = await lireAdminUsers(event)
  if (!lectureOk) {
    throw createError({
      statusCode: 503,
      message: "Impossible de vérifier la liste des administrateurs (Firestore injoignable). Création du premier admin refusée — réessayer plus tard, ou vérifier GET /api/health.",
    })
  }
  if (currentUsers.length > 0) {
    throw createError({ statusCode: 400, message: 'Des admins existent déjà. Utilisez la gestion des admins.' })
  }

  // Le premier admin bootstrappé obtient toujours le rôle complet 'admin'
  const users = [{ email: userInfo.email.toLowerCase(), role: 'admin' as const }]

  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    const { setAdminUsersMock } = await import('../../utils/firestore-mock.js')
    setAdminUsersMock(users)
    return { success: true, message: 'Premier admin créé' }
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
    await setFirestoreDoc(config.projectId, accessToken, 'settings', 'admins', {
      users,
      updatedAt: new Date().toISOString(),
      updatedBy: userInfo.uid,
    })

    return { success: true, message: 'Premier admin créé' }
  } catch (e: any) {
    console.error('setup error:', e?.message || e?.toString() || e)
    throw createError({ statusCode: 500, message: 'Erreur lors de la création du premier admin.' })
  }
})
