import { getFirestoreConfig, getAccessToken, setFirestoreDoc } from '../../utils/firebase'
import { requireSuperAdmin, getAdminUsers, ADMIN_ROLES } from '../../utils/firebase-admin'

// Change le rôle d'un admin existant
export default defineEventHandler(async (event) => {
  const callerInfo = await requireSuperAdmin(event)

  const body = await readBody(event)
  const targetEmail = body?.email?.trim().toLowerCase()
  const role = body?.role
  if (!targetEmail) {
    throw createError({ statusCode: 400, message: 'Email manquant' })
  }
  if (!ADMIN_ROLES.includes(role)) {
    throw createError({ statusCode: 400, message: `Rôle invalide (attendu : ${ADMIN_ROLES.join(', ')})` })
  }

  // Empêcher un admin de se rétrograder lui-même (éviter le verrouillage total)
  if (callerInfo.email && targetEmail === callerInfo.email.toLowerCase() && role !== 'admin') {
    throw createError({ statusCode: 400, message: 'Impossible de modifier son propre rôle' })
  }

  const currentUsers = await getAdminUsers(event)
  const target = currentUsers.find(u => u.email === targetEmail)
  if (!target) {
    throw createError({ statusCode: 404, message: 'Email pas dans la liste admin' })
  }

  const updatedUsers = currentUsers.map(u => u.email === targetEmail ? { ...u, role } : u)

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
