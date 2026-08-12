import { fetchWithTimeout } from './http'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export interface FirestoreConfig {
  projectId: string
  clientEmail: string
  privateKey: string
}

export function getFirestoreConfig(event: any): FirestoreConfig | null {
  const config = useRuntimeConfig(event)
  const projectId = (config.firebaseProjectId || process.env.NUXT_FIREBASE_PROJECT_ID || '') as string
  const clientEmail = (config.firebaseClientEmail || process.env.NUXT_FIREBASE_CLIENT_EMAIL || '') as string
  const privateKey = (config.firebasePrivateKey || process.env.NUXT_FIREBASE_PRIVATE_KEY || '') as string

  if (!projectId || !clientEmail || !privateKey) return null
  return { projectId, clientEmail, privateKey }
}

/**
 * Message d'erreur d'une clé privée mal recopiée. Levé ici plutôt que laissé
 * remonter tel quel : le `atob()` natif échoue sur « atob() called with
 * invalid base64-encoded string », qui traverse toute la pile et ressort au
 * visiteur en « Erreur chargement menu: atob() called with invalid
 * base64-encoded string » — constaté sur l'environnement de recette. Rien
 * n'indique alors qu'il s'agit d'un secret mal collé, ni lequel, alors que
 * c'est la panne de configuration la plus courante ici (retours à la ligne
 * perdus ou guillemets conservés au copier-coller dans le dashboard
 * Cloudflare). `GET /api/health` répond déjà à la question en une requête,
 * encore faut-il savoir qu'il faut la poser.
 */
export const ERREUR_CLE_PRIVEE =
  'Clé privée Firebase illisible (NUXT_FIREBASE_PRIVATE_KEY) : contenu non décodable en base64, ' +
  'typiquement des retours à la ligne perdus ou des guillemets conservés au copier-coller. ' +
  'Vérifier avec GET /api/health (champ firestore.privateKeyValide).'

async function pemToArrayBuffer(pem: string): Promise<ArrayBuffer> {
  const base64 = pem
    .replace(/-----BEGIN [\w\s]+-----/g, '')
    .replace(/-----END [\w\s]+-----/g, '')
    .replace(/\s/g, '')
  let binary: string
  try {
    binary = atob(base64)
  } catch {
    throw new Error(ERREUR_CLE_PRIVEE)
  }
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const keyData = await pemToArrayBuffer(pem)
  try {
    return await crypto.subtle.importKey(
      'pkcs8',
      keyData,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    )
  } catch {
    // Base64 valide mais qui n'est pas une clé PKCS8 : même symptôme côté
    // utilisateur (message cryptique de WebCrypto remontant jusqu'à la page),
    // même remède.
    throw new Error(ERREUR_CLE_PRIVEE)
  }
}

/** base64url sans remplissage — l'encodage qu'exige un JWT. */
function base64Url(input: string): string {
  return btoa(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

/**
 * Jeton d'accès en cache, à l'échelle de l'isolat.
 *
 * Sans lui, CHAQUE requête Firestore recommençait tout : import de la clé
 * privée, signature RSA, puis un aller-retour vers `oauth2.googleapis.com`
 * avant même de parler à Firestore. Le rendu d'une page en déclenche au moins
 * trois (`/api/menu`, `/api/footer`, `/api/pages/:slug`), chacune payant ce
 * préambule pour un jeton valable une heure et jeté aussitôt.
 *
 * La promesse est mise en cache, pas seulement sa valeur : plusieurs requêtes
 * arrivant ensemble sur un isolat froid partagent ainsi un seul aller-retour
 * au lieu d'en lancer autant qu'elles sont. En cas d'échec, l'entrée est
 * retirée pour que la tentative suivante reparte proprement.
 *
 * La clé du cache inclut le compte de service : prod et recette n'ont pas le
 * même, et un jeton de l'un n'ouvre rien chez l'autre.
 */
const CACHE_JETON = new Map<string, { promesse: Promise<{ token: string; expireA: number }>; expireA: number }>()

/** Marge avant expiration : un jeton qui périme en cours de requête ne sert à rien. */
const MARGE_EXPIRATION_MS = 5 * 60 * 1000

export async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const cle = clientEmail
  const enCache = CACHE_JETON.get(cle)
  if (enCache && enCache.expireA > Date.now()) {
    try {
      return (await enCache.promesse).token
    } catch {
      // Promesse rejetée entre-temps : on repart sur une demande neuve.
      CACHE_JETON.delete(cle)
    }
  }

  const promesse = demanderJeton(clientEmail, privateKey)
  // Fenêtre volontairement courte tant que la vraie durée de vie n'est pas
  // connue : elle ne sert qu'à mutualiser les requêtes concurrentes.
  CACHE_JETON.set(cle, { promesse, expireA: Date.now() + 30_000 })
  try {
    const { token, expireA } = await promesse
    CACHE_JETON.set(cle, { promesse, expireA })
    return token
  } catch (err) {
    CACHE_JETON.delete(cle)
    throw err
  }
}

async function demanderJeton(clientEmail: string, privateKey: string): Promise<{ token: string; expireA: number }> {
  const now = Math.floor(Date.now() / 1000)
  const expiry = now + 3600

  const header = { alg: 'RS256', typ: 'JWT' }
  const claimSet = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/firebase.messaging',
    aud: GOOGLE_TOKEN_URL,
    exp: expiry,
    iat: now,
  }

  // base64url, pas base64 : l'en-tête ne contient par chance ni `+`, ni `/`,
  // ni remplissage, mais le jeu de revendications, lui, en produit — il finit
  // par un `=` de remplissage, et les URL de `scope` peuvent donner des `/`.
  // Google l'acceptait jusqu'ici ; rien ne l'y oblige.
  const encodedHeader = base64Url(JSON.stringify(header))
  const encodedClaimSet = base64Url(JSON.stringify(claimSet))
  const signatureInput = `${encodedHeader}.${encodedClaimSet}`

  const key = privateKey.replace(/\\n/g, '\n')
  const cryptoKey = await importPrivateKey(key)
  const signatureBuffer = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  )
  const encodedSignature = base64Url(String.fromCharCode(...new Uint8Array(signatureBuffer)))

  const jwt = `${encodedHeader}.${encodedClaimSet}.${encodedSignature}`

  const response = await fetchWithTimeout(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to get access token: ${text}`)
  }

  const data = await response.json()
  const dureeMs = (Number(data.expires_in) || 3600) * 1000
  return {
    token: data.access_token,
    expireA: Date.now() + Math.max(dureeMs - MARGE_EXPIRATION_MS, 60_000),
  }
}

export async function getFirestoreDoc(
  projectId: string,
  accessToken: string,
  collection: string,
  docId: string
): Promise<any | null> {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`

  const response = await fetchWithTimeout(url, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 404) return null
    const text = await response.text()
    throw new Error(`Firestore error: ${text}`)
  }

  const data = await response.json()
  return data
}

export async function listFirestoreCollection(
  projectId: string,
  accessToken: string,
  collection: string
): Promise<any[]> {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}`

  const response = await fetchWithTimeout(url, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    if (response.status === 404) return []
    const text = await response.text()
    throw new Error(`Firestore list error: ${text}`)
  }

  const data = await response.json()
  return data.documents || []
}

export function encodeFirestoreValue(value: any): any {
  if (value === null || value === undefined) return { nullValue: null }
  if (typeof value === 'string') return { stringValue: value }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { integerValue: String(value) }
    return { doubleValue: value }
  }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (value instanceof Date) return { timestampValue: value.toISOString() }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(encodeFirestoreValue) } }
  }
  if (typeof value === 'object') {
    const fields: Record<string, any> = {}
    for (const [k, v] of Object.entries(value)) {
      fields[k] = encodeFirestoreValue(v)
    }
    return { mapValue: { fields } }
  }
  return { nullValue: null }
}

export function encodeFirestoreDoc(data: Record<string, any>): any {
  const fields: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    fields[key] = encodeFirestoreValue(value)
  }
  return { fields }
}

export async function setFirestoreDoc(
  projectId: string,
  accessToken: string,
  collection: string,
  docId: string,
  data: Record<string, any>,
  updateMask?: string[]
): Promise<void> {
  // Sans updateMask, le PATCH Firestore remplace le document ENTIER
  // (les champs absents de `data` sont perdus). Avec un mask, seuls
  // les champs listés sont modifiés.
  let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`
  if (updateMask?.length) {
    url += '?' + updateMask.map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&')
  }

  const response = await fetchWithTimeout(url, {
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(encodeFirestoreDoc(data)),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Firestore write error: ${text}`)
  }
}

/**
 * Écriture conditionnelle : n'aboutit QUE si le document n'a pas changé depuis
 * la lecture (`expectedUpdateTime`). Renvoie false si quelqu'un est passé
 * avant, sans rien écrire.
 *
 * C'est ce qui empêche deux personnes de prendre la même tâche : les deux
 * lisent le même `updateTime`, la première écriture le fait changer, la
 * seconde est rejetée par Firestore (400) au lieu d'écraser la première.
 * Vérifié en conditions réelles : sur deux prises simultanées, exactement
 * une aboutit.
 */
export async function setFirestoreDocIfUnchanged(
  projectId: string,
  accessToken: string,
  collection: string,
  docId: string,
  data: Record<string, any>,
  updateMask: string[],
  expectedUpdateTime: string
): Promise<boolean> {
  const params = [
    `currentDocument.updateTime=${encodeURIComponent(expectedUpdateTime)}`,
    ...updateMask.map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`),
  ]
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}?${params.join('&')}`

  const response = await fetchWithTimeout(url, {
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(encodeFirestoreDoc(data)),
  })

  if (response.ok) return true
  // 400 (précondition non satisfaite) et 409 = quelqu'un a modifié le
  // document entre-temps. Toute autre erreur est un vrai problème.
  if (response.status === 400 || response.status === 409) return false
  const text = await response.text()
  throw new Error(`Firestore conditional write error: ${text}`)
}

export async function deleteFirestoreDoc(
  projectId: string,
  accessToken: string,
  collection: string,
  docId: string
): Promise<void> {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`

  const response = await fetchWithTimeout(url, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Firestore delete error: ${text}`)
  }
}

export function parseFirestoreDoc(doc: any): Record<string, any> | null {
  if (!doc || !doc.fields) return null

  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(doc.fields)) {
    result[key] = parseFirestoreValue(value)
  }
  return result
}

function parseFirestoreValue(value: any): any {
  if ('stringValue' in value) return value.stringValue
  if ('integerValue' in value) return parseInt(value.integerValue, 10)
  if ('doubleValue' in value) return value.doubleValue
  if ('booleanValue' in value) return value.booleanValue
  if ('timestampValue' in value) return new Date(value.timestampValue)
  if ('arrayValue' in value) {
    return (value.arrayValue.values || []).map(parseFirestoreValue)
  }
  if ('mapValue' in value) {
    const result: Record<string, any> = {}
    for (const [k, v] of Object.entries(value.mapValue.fields || {})) {
      result[k] = parseFirestoreValue(v)
    }
    return result
  }
  if ('nullValue' in value) return null
  if ('referenceValue' in value) return value.referenceValue
  return undefined
}
