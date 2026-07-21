import { getFirestoreConfig, getAccessToken, setFirestoreDoc } from '../../utils/firebase'
import { requireSuperAdmin, getAdminUsers, ADMIN_ROLES } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const callerInfo = await requireSuperAdmin(event)

  const body = await readBody(event)
  const newEmail = body?.email?.trim().toLowerCase()
  const role = ADMIN_ROLES.includes(body?.role) ? body.role : 'editor'
  if (!newEmail) {
    throw createError({ statusCode: 400, message: 'Email manquant' })
  }

  const currentUsers = await getAdminUsers(event)

  if (currentUsers.some(u => u.email === newEmail)) {
    return { success: true, message: 'Déjà admin', users: currentUsers }
  }

  const updatedUsers = [...currentUsers, { email: newEmail, role }]

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
