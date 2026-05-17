const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
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

  const encodedHeader = btoa(JSON.stringify(header))
  const encodedClaimSet = btoa(JSON.stringify(claimSet))
  const signatureInput = `${encodedHeader}.${encodedClaimSet}`

  // Create JWT signature using crypto
  const crypto = await import('node:crypto')
  const key = privateKey.replace(/\\n/g, '\n')
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(signatureInput)
  sign.end()
  const signature = sign.sign(key)
  const encodedSignature = Buffer.from(signature).toString('base64url')

  const jwt = `${encodedHeader}.${encodedClaimSet}.${encodedSignature}`

  const response = await fetch(GOOGLE_TOKEN_URL, {
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
  return data.access_token
}

export async function getFirestoreDoc(
  projectId: string,
  accessToken: string,
  collection: string,
  docId: string
): Promise<any | null> {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`

  const response = await fetch(url, {
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
