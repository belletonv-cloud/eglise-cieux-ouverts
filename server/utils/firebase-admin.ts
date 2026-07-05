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

function decodeTokenPayload(idToken: string): FirebaseUserInfo | null {
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

export async function verifyFirebaseToken(idToken: string, event?: any): Promise<FirebaseUserInfo | null> {
  // Validation côté serveur via l'API Identity Toolkit : c'est Google qui
  // vérifie la signature du token. Un simple décodage du payload serait
  // falsifiable par n'importe qui.
  const apiKey = event
    ? (useRuntimeConfig(event).public?.FIREBASE_API_KEY as string | undefined)
    : process.env.NUXT_PUBLIC_FIREBASE_API_KEY
  if (apiKey) {
    try {
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      if (!res.ok) return null
      const data = await res.json()
      const user = data.users?.[0]
      if (!user) return null
      return {
        uid: user.localId,
        email: user.email || null,
        email_verified: !!user.emailVerified,
      }
    } catch {
      return null
    }
  }
  // Repli sans clé API (dev local) : décodage sans vérification de signature
  return decodeTokenPayload(idToken)
}

/**
 * Vérifie l'en-tête Authorization, valide le token Firebase et exige
 * que l'utilisateur soit admin. Lève une erreur HTTP sinon.
 */
export async function requireAdmin(event: any): Promise<FirebaseUserInfo> {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }
  const userInfo = await verifyFirebaseToken(authHeader.slice(7), event)
  if (!userInfo) {
    throw createError({ statusCode: 401, message: 'Token invalide' })
  }
  if (!await isUserAdmin(event, userInfo.email)) {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }
  return userInfo
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

export async function isUserAdmin(event: any, email: string | null): Promise<boolean> {
  if (!email) return false
  const emails = await getAdminEmails(event)
  return emails.map(e => e.toLowerCase()).includes(email.toLowerCase())
}
