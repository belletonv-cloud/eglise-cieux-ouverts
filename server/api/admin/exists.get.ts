import { getAdminUids, getAdminEmails } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const [uids, emails] = await Promise.all([getAdminUids(event), getAdminEmails(event)])
  return { exists: uids.length > 0 || emails.length > 0 }
})
