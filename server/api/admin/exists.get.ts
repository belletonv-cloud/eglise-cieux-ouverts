import { getAdminUsers } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  try {
    const users = await getAdminUsers(event)
    return { exists: users.length > 0 }
  } catch {
    return { exists: false }
  }
})
