import { getFirestoreConfig, getAccessToken, getFirestoreDoc, parseFirestoreDoc } from './firebase'

export interface FirebaseUserInfo {
  uid: string
  email: string | null
  email_verified: boolean
}

export type AdminRole = 'admin' | 'editor'
export const ADMIN_ROLES: AdminRole[] = ['admin', 'editor']

export interface AdminUserEntry {
  email: string
  role: AdminRole
}

function isTestEnv(): boolean {
  return process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
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
  // Le plugin auth-mock.client.ts envoie ce token fixe en mode E2E — il ne
  // s'agit pas d'un JWT, donc il faut le reconnaître avant toute tentative
  // de décodage (sinon 401 systématique, ce qui a longtemps laissé les
  // endpoints /api/admin/* totalement invérifiables en test). Un suffixe
  // ':email' optionnel permet aux tests d'appeler l'API directement en
  // simulant un utilisateur précis (utile pour tester les permissions
  // par rôle sans dépendre du seul utilisateur mock côté client).
  if (isTestEnv() && idToken.startsWith('mock-test-token')) {
    const [, overrideEmail] = idToken.split(':')
    return { uid: 'cli-test', email: overrideEmail || 'ci-admin@tests.fr', email_verified: true }
  }

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

// Normalise le document 'settings/admins' : accepte le nouveau format
// (users: [{email, role}]) et l'ancien format legacy (emails: string[]),
// où chaque email legacy est traité comme role 'admin' (comportement
// identique à avant l'introduction des rôles : tout le monde avait accès
// complet).
function normalizeAdminUsers(data: Record<string, any> | null): AdminUserEntry[] {
  if (data?.users?.length) {
    return data.users
      .filter((u: any) => u?.email)
      .map((u: any) => ({
        email: String(u.email).toLowerCase(),
        role: ADMIN_ROLES.includes(u.role) ? u.role : 'editor',
      }))
  }
  if (data?.emails?.length) {
    return data.emails.map((e: string) => ({ email: e.toLowerCase(), role: 'admin' as const }))
  }
  return []
}

export async function getAdminUsers(event: any): Promise<AdminUserEntry[]> {
  if (isTestEnv()) {
    const { getAdminUsersMock } = await import('./firestore-mock.js')
    return getAdminUsersMock()
  }

  const config = getFirestoreConfig(event)
  if (!config) return []

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const doc = await getFirestoreDoc(config.projectId, accessToken, 'settings', 'admins')
    if (!doc) return []
    return normalizeAdminUsers(parseFirestoreDoc(doc))
  } catch {
    return []
  }
}

export async function getAdminEmails(event: any): Promise<string[]> {
  const users = await getAdminUsers(event)
  return users.map(u => u.email)
}

export async function getUserRole(event: any, email: string | null): Promise<AdminRole | null> {
  if (!email) return null
  const users = await getAdminUsers(event)
  const match = users.find(u => u.email === email.toLowerCase())
  return match?.role || null
}

export async function isUserAdmin(event: any, email: string | null): Promise<boolean> {
  return (await getUserRole(event, email)) !== null
}

/**
 * Vérifie l'en-tête Authorization, valide le token Firebase et exige
 * que l'utilisateur ait un rôle (admin ou editor). Lève une erreur HTTP sinon.
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

/**
 * Comme requireAdmin, mais exige en plus le rôle 'admin' (accès complet).
 * Réservé aux actions sensibles : gérer les autres comptes admin/rôles.
 */
export async function requireSuperAdmin(event: any): Promise<FirebaseUserInfo> {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }
  const userInfo = await verifyFirebaseToken(authHeader.slice(7), event)
  if (!userInfo) {
    throw createError({ statusCode: 401, message: 'Token invalide' })
  }
  const role = await getUserRole(event, userInfo.email)
  if (role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Seuls les administrateurs (rôle admin) peuvent gérer les comptes' })
  }
  return userInfo
}
