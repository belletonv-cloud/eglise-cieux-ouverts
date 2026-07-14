import { getFirestoreConfig, getAccessToken, setFirestoreDoc } from '../../utils/firebase'
import { requireSuperAdmin, getAdminUsers } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const callerInfo = await requireSuperAdmin(event)

  const body = await readBody(event)
  const targetEmail = body?.email?.trim().toLowerCase()
  if (!targetEmail) {
    throw createError({ statusCode: 400, message: 'Email manquant' })
  }

  // Empêcher un admin de se retirer lui-même (éviter le verrouillage total)
  if (callerInfo.email && targetEmail === callerInfo.email.toLowerCase()) {
    throw createError({ statusCode: 400, message: 'Impossible de se retirer soi-même' })
  }

  const currentUsers = await getAdminUsers(event)
  const updatedUsers = currentUsers.filter(u => u.email !== targetEmail)
  if (updatedUsers.length === currentUsers.length) {
    throw createError({ statusCode: 404, message: 'Email pas dans la liste admin' })
  }

  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    const { setAdminUsersMock } = await import('../../utils/firestore-mock.js')
    setAdminUsersMock(updatedUsers)
    return { success: true, users: updatedUsers }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  const token = await getAccessToken(config.clientEmail, config.privateKey)
  await setFirestoreDoc(config.projectId, token, 'settings', 'admins', {
    users: updatedUsers,
    updatedAt: new Date().toISOString(),
    updatedBy: callerInfo.uid,
  })

  return { success: true, users: updatedUsers }
})
