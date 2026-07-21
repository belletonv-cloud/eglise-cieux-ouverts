import { verifyFirebaseToken, getAdminUsers, getUserRole } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAdmin: false }
  }

  const idToken = authHeader.slice(7)
  const userInfo = await verifyFirebaseToken(idToken, event)
  if (!userInfo) {
    return { isAdmin: false }
  }

  const users = await getAdminUsers(event)
  const role = await getUserRole(event, userInfo.email)
  return {
    isAdmin: role !== null,
    role,
    setupMode: users.length === 0,
    uid: userInfo.uid,
    email: userInfo.email,
  }
})
