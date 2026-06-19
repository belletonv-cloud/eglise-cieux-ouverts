import { verifyFirebaseToken, isUserAdmin, getAdminEmails } from '../../utils/firebase-admin'

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

  const admin = await isUserAdmin(event, userInfo.email)
  const emails = await getAdminEmails(event)
  return {
    isAdmin: admin,
    setupMode: emails.length === 0,
    uid: userInfo.uid,
    email: userInfo.email,
  }
})
