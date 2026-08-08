import { getFirestoreConfig, getAccessToken, getFirestoreDoc, parseFirestoreDoc } from './firebase'
import { fetchWithTimeout } from './http'

export interface FirebaseUserInfo {
  uid: string
  email: string | null
  email_verified: boolean
}

// 'planning' n'est PAS un rôle d'édition du site : il ne donne accès qu'au
// tableau des tâches. Il ne doit donc jamais passer requireAdmin, qui garde
// les 19 endpoints d'édition (pages, menu, footer, réglages...).
export type AdminRole = 'admin' | 'editor' | 'planning'
export const ADMIN_ROLES: AdminRole[] = ['admin', 'editor', 'planning']

/** Rôles autorisés à modifier le contenu du site. */
export const SITE_EDITOR_ROLES: AdminRole[] = ['admin', 'editor']

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
      const res = await fetchWithTimeout(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
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

/** A un rôle quelconque : peut se connecter à l'espace d'administration. */
export async function isUserAdmin(event: any, email: string | null): Promise<boolean> {
  return (await getUserRole(event, email)) !== null
}

/**
 * L'appelant est-il un admin authentifié ? Contrôle NON bloquant : renvoie
 * false au lieu de lever, pour les endpoints publics qui doivent répondre 200
 * à tout le monde mais réserver certains champs aux admins (`/api/settings`
 * pour les emails de destination, `/api/health` pour l'adresse expéditeur).
 * Pour exiger réellement un admin, utiliser `requireAdmin`.
 */
export async function callerIsAdmin(event: any): Promise<boolean> {
  const header = getHeader(event, 'authorization')
  if (!header?.startsWith('Bearer ')) return false
  try {
    const user = await verifyFirebaseToken(header.slice(7), event)
    return await isUserAdmin(event, user?.email ?? null)
  } catch {
    return false
  }
}

/**
 * Authentifie et renvoie le rôle, ou lève 401. Ne décide d'aucune permission :
 * c'est à l'appelant de vérifier le rôle obtenu.
 */
async function authenticate(event: any): Promise<{ user: FirebaseUserInfo; role: AdminRole | null }> {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }
  const user = await verifyFirebaseToken(authHeader.slice(7), event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Token invalide' })
  }
  return { user, role: await getUserRole(event, user.email) }
}

/**
 * Exige un rôle d'édition du site (admin ou editor). Le rôle 'planning' est
 * volontairement refusé : il ne donne accès qu'au tableau des tâches.
 */
export async function requireAdmin(event: any): Promise<FirebaseUserInfo> {
  const { user, role } = await authenticate(event)
  if (!role || !SITE_EDITOR_ROLES.includes(role)) {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }
  return user
}

/**
 * Exige un accès au tableau des tâches : tout rôle connu convient, y compris
 * 'planning', qui existe précisément pour ça.
 */
export async function requireTaskAccess(event: any): Promise<FirebaseUserInfo> {
  const { user, role } = await authenticate(event)
  if (!role) {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }
  return user
}

/**
 * Comme requireAdmin, mais exige en plus le rôle 'admin' (accès complet).
 * Réservé aux actions sensibles : gérer les autres comptes admin/rôles.
 */
export async function requireSuperAdmin(event: any): Promise<FirebaseUserInfo> {
  const { user, role } = await authenticate(event)
  if (role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Seuls les administrateurs (rôle admin) peuvent gérer les comptes' })
  }
  return user
}
