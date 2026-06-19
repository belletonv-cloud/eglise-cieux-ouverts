import { getFirestoreConfig, getAccessToken, getFirestoreDoc, parseFirestoreDoc } from '../../utils/firebase'

export default defineEventHandler(async (event) => {
  const config = getFirestoreConfig(event)
  if (!config) return { exists: false }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const doc = await getFirestoreDoc(config.projectId, accessToken, 'settings', 'admins')
    if (!doc) return { exists: false }
    const parsed = parseFirestoreDoc(doc)
    const emails: string[] = parsed?.emails || []
    return { exists: emails.length > 0 }
  } catch {
    return { exists: false }
  }
})
