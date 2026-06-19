import { getFirestoreConfig, getAccessToken, getFirestoreDoc, parseFirestoreDoc } from './firebase'

export interface FirebaseUserInfo {
  uid: string
  email: string | null
  email_verified: boolean
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return atob(str)
}

export function verifyFirebaseToken(idToken: string): FirebaseUserInfo | null {
  try {
    const parts = idToken.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(base64UrlDecode(parts[1]))
    if (!payload.sub) return null
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) return null
    if (payload.iat && payload.iat > now) return null
    return {
      uid: payload.sub,
      email: payload.email || null,
      email_verified: !!payload.email_verified,
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

export async function getAdminEmails(event: any): Promise<string[]> {
  const config = getFirestoreConfig(event)
  if (!config) return []

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const doc = await getFirestoreDoc(config.projectId, accessToken, 'settings', 'admins')
    if (!doc) return []
    const parsed = parseFirestoreDoc(doc)
    return parsed?.emails || []
  } catch {
    return []
  }
}

export async function isUserAdmin(event: any, uid: string, email: string | null): Promise<boolean> {
  const [uids, emails] = await Promise.all([getAdminUids(event), getAdminEmails(event)])
  if (uids.includes(uid)) return true
  if (email && emails.map(e => e.toLowerCase()).includes(email.toLowerCase())) return true
  return false
}

export async function getAdminUidList(event: any): Promise<string[]> {
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
