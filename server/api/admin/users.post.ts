import { getFirestoreConfig, getAccessToken, setFirestoreDoc } from '../../utils/firebase'
import { verifyFirebaseToken, getAdminEmails } from '../../utils/firebase-admin'

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
  const newEmail = body?.email?.trim().toLowerCase()
  if (!newEmail) {
    throw createError({ statusCode: 400, message: 'Email manquant' })
  }

  const currentEmails = await getAdminEmails(event)

  // Vérifier que l'appelant est déjà admin
  if (!callerInfo.email || !currentEmails.map(e => e.toLowerCase()).includes(callerInfo.email.toLowerCase())) {
    throw createError({ statusCode: 403, message: 'Seuls les admins peuvent gérer les comptes' })
  }

  if (currentEmails.map(e => e.toLowerCase()).includes(newEmail)) {
    return { success: true, message: 'Déjà admin', emails: currentEmails }
  }

  currentEmails.push(newEmail)
  const token = await getAccessToken(config.clientEmail, config.privateKey)
  await setFirestoreDoc(config.projectId, token, 'settings', 'admins', {
    emails: currentEmails,
    updatedAt: new Date().toISOString(),
    updatedBy: callerInfo.uid,
  })

  return { success: true, emails: currentEmails }
})
