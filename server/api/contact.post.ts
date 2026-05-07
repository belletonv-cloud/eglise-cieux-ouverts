const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 3, // max 3 requests per IP per window
}
const rateLimitStore = new Map()

function getRateLimitKey(event) {
  return getRequestIP(event) || 'unknown'
}

function checkRateLimit(key) {
  const now = Date.now()
  const entry = rateLimitStore.get(key)
  
  if (!entry || now - entry.resetTime > RATE_LIMIT.windowMs) {
    rateLimitStore.set(key, { count: 1, resetTime: now })
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 }
  }
  
  if (entry.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: Math.ceil((entry.resetTime + RATE_LIMIT.windowMs - now) / 1000) }
  }
  
  entry.count++
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - entry.count }
}

function assertString(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)
  
  // Rate limiting check
  const rateLimitKey = getRateLimitKey(event)
  const rateCheck = checkRateLimit(rateLimitKey)
  if (!rateCheck.allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: `Trop de requêtes. Réessayez dans ${rateCheck.resetIn} secondes.`
    })
  }
  
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
  
    // Envoyer notification email via Resend
    const resendApiKey = process.env.NUXT_RESEND_API_KEY || ''
    
    if (resendApiKey) {
      const emailHtml = `
        <h2>Nouveau contact reçu</h2>
        <p><strong>Nom :</strong> ${prenom} ${nom}</p>
        <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
        ${ville ? `<p><strong>Ville :</strong> ${ville}</p>` : ''}
        <p><strong>Message :</strong></p>
        <div style="background:#f5f5f5;padding:15px;border-radius:8px;margin:10px 0">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <p><small>Reçu le ${new Date().toLocaleString('fr-FR')}</small></p>
        <p><a href="https://console.firebase.google.com/project/eglise-cieux-ouverts/firestore/data/~2Fcontacts">Voir dans Firestore</a></p>
      `
      
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Contact <onboarding@resend.dev>',
          to: ['belletonv@gmail.com'],
          subject: `Nouveau contact : ${prenom} ${nom}`,
          html: emailHtml,
        }),
      })
      
      if (!resendResponse.ok) {
        const errorText = await resendResponse.text()
        console.error('Resend error:', errorText)
      } else {
        console.log('Resend success')
      }
    }
  
    return { ok: true }
  } catch (err) {
    console.error('Contact API error:', err)
    throw createError({ statusCode: 500, statusMessage: err.message || 'Server Error' })
  }
})
