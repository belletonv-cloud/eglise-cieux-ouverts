import { verifyFirebaseToken, getAdminUsers } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const userInfo = await verifyFirebaseToken(authHeader.slice(7), event)
  if (!userInfo) {
    throw createError({ statusCode: 401, message: 'Token invalide' })
  }

  const users = await getAdminUsers(event)

  if (users.length === 0) {
    throw createError({ statusCode: 404, message: 'Aucun administrateur configuré' })
  }

  const isAdmin = !!(userInfo.email && users.some(u => u.email === userInfo.email!.toLowerCase()))
  if (!isAdmin) {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  return { users }
})
