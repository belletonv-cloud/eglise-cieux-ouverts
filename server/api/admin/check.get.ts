import { verifyFirebaseToken, isUserAdmin } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAdmin: false }
  }

  const idToken = authHeader.slice(7)
  const userInfo = await verifyFirebaseToken(idToken)
  if (!userInfo) {
    return { isAdmin: false }
  }

  const admin = await isUserAdmin(event, userInfo.uid)
  return { isAdmin: admin, uid: userInfo.uid, email: userInfo.email }
})
