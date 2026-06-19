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
  const targetEmail = body?.email?.trim().toLowerCase()
  if (!targetEmail) {
    throw createError({ statusCode: 400, message: 'Email manquant' })
  }

  // Empêcher un admin de se retirer lui-même
  if (callerInfo.email && targetEmail === callerInfo.email.toLowerCase()) {
    throw createError({ statusCode: 400, message: 'Impossible de se retirer soi-même' })
  }

  const currentEmails = await getAdminEmails(event)

  // Vérifier que l'appelant est admin
  if (!callerInfo.email || !currentEmails.map(e => e.toLowerCase()).includes(callerInfo.email.toLowerCase())) {
    throw createError({ statusCode: 403, message: 'Seuls les admins peuvent gérer les comptes' })
  }

  const updatedEmails = currentEmails.filter(e => e.toLowerCase() !== targetEmail)
  if (updatedEmails.length === currentEmails.length) {
    throw createError({ statusCode: 404, message: 'Email pas dans la liste admin' })
  }

  const token = await getAccessToken(config.clientEmail, config.privateKey)
  await setFirestoreDoc(config.projectId, token, 'settings', 'admins', {
    emails: updatedEmails,
    updatedAt: new Date().toISOString(),
    updatedBy: callerInfo.uid,
  })

  return { success: true, emails: updatedEmails }
})
