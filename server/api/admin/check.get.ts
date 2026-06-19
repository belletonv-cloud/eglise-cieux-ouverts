import { verifyFirebaseToken, isUserAdmin, getAdminUids } from '../../utils/firebase-admin'

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

  const admin = await isUserAdmin(event, userInfo.uid, userInfo.email)
  const uids = await getAdminUids(event)
  return {
    isAdmin: admin,
    setupMode: uids.length === 0,
    uid: userInfo.uid,
    email: userInfo.email,
  }
})
