import { getFirestoreConfig, getAccessToken, getFirestoreDoc, parseFirestoreDoc } from './firebase'

const TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo'

export interface FirebaseUserInfo {
  uid: string
  email: string | null
  email_verified: boolean
}

export async function verifyFirebaseToken(idToken: string): Promise<FirebaseUserInfo | null> {
  try {
    const url = `${TOKEN_INFO_URL}?id_token=${encodeURIComponent(idToken)}`
    const response = await fetch(url)
    if (!response.ok) return null
    const data = await response.json()
    return {
      uid: data.sub,
      email: data.email || null,
      email_verified: !!data.email_verified,
    }
  } catch {
    return null
  }
}

export async function getAdminUids(event: any): Promise<string[]> {
  const config = getFirestoreConfig(event)
  if (!config) return []

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const doc = await getFirestoreDoc(config.projectId, accessToken, 'settings', 'admins')
    if (!doc) return []
    const parsed = parseFirestoreDoc(doc)
    return parsed?.uids || []
  } catch {
    return []
  }
}

export async function isUserAdmin(event: any, uid: string): Promise<boolean> {
  const uids = await getAdminUids(event)
  return uids.includes(uid)
}
