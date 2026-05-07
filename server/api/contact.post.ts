const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

function base64UrlEncode(input: string | Uint8Array) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function createSignedJwt(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: GOOGLE_TOKEN_URL,
    scope: 'https://www.googleapis.com/auth/datastore',
    iat: now,
    exp: now + 3600,
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const unsignedToken = `${encodedHeader}.${encodedPayload}`

  const keyData = privateKey.replace(/\\n/g, '\n')
  const binaryKey = Uint8Array.from(atob(keyData
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '')), char => char.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  )

  return `${unsignedToken}.${base64UrlEncode(new Uint8Array(signature))}`
}

async function getAccessToken(clientEmail: string, privateKey: string) {
  const assertion = await createSignedJwt(clientEmail, privateKey)
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })

  if (!response.ok) {
    throw new Error(`OAuth token error: ${response.status}`)
  }

  const data = await response.json()
  return data.access_token
}

function assertString(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  
  // Cloudflare Pages: read from process.env directly
  const firebaseProjectId = process.env.NUXT_FIREBASE_PROJECT_ID || config.firebaseProjectId || ''
  const firebaseClientEmail = process.env.NUXT_FIREBASE_CLIENT_EMAIL || config.firebaseClientEmail || ''
  const firebasePrivateKey = process.env.NUXT_FIREBASE_PRIVATE_KEY || config.firebasePrivateKey || ''
  
  const prenom = assertString(body?.prenom, 80)
  const nom = assertString(body?.nom, 80)
  const ville = assertString(body?.ville, 120)
  const email = assertString(body?.email, 180).toLowerCase()
  const message = assertString(body?.message, 4000)
  const website = assertString(body?.website, 200)
  const source = assertString(body?.source, 200) || '/contact'
  const newsletter = Boolean(body?.newsletter)
  
  if (!prenom || !nom || !email || !message) {
    throw createError({ statusCode: 400, statusMessage: 'Champs obligatoires manquants.' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Email invalide.' })
  }
  if (message.length < 10) {
    throw createError({ statusCode: 400, statusMessage: 'Message trop court.' })
  }
  if (website) {
    throw createError({ statusCode: 400, statusMessage: 'Envoi bloqué.' })
  }
  if (!firebaseClientEmail || !firebasePrivateKey || !firebaseProjectId) {
    throw createError({ statusCode: 503, statusMessage: 'Configuration serveur contact incomplète.' })
  }
  
  try {
    const accessToken = await getAccessToken(firebaseClientEmail, firebasePrivateKey)
    
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/contacts`
    
    const response = await fetch(firestoreUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          prenom: { stringValue: prenom },
          nom: { stringValue: nom },
          ville: { stringValue: ville },
          email: { stringValue: email },
          message: { stringValue: message },
          newsletter: { booleanValue: newsletter },
          source: { stringValue: source },
          status: { stringValue: 'new' },
          ip: { stringValue: getRequestIP(event) || '' },
          userAgent: { stringValue: getRequestHeader(event, 'user-agent') || '' },
          language: { stringValue: getRequestHeader(event, 'accept-language') || '' },
          createdAt: { timestampValue: new Date().toISOString() },
        },
      }),
    })
  
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Firestore error: ${errorText}`)
    }
  
    return { ok: true }
  } catch (err) {
    console.error('Contact API error:', err)
    throw createError({ statusCode: 500, statusMessage: err.message || 'Server Error' })
  }
})
