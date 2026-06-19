import { getAdminUids } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const uids = await getAdminUids(event)
  return { exists: uids.length > 0 }
})
