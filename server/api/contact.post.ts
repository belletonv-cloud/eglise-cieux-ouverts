import { getAccessToken, getFirestoreDoc, setFirestoreDoc, parseFirestoreDoc } from '../utils/firebase'
import { getEmailQuotaLimit } from '../utils/email-quota'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
// Note: in-memory rate limiting is best-effort on serverless (Cloudflare Pages).
// Each cold start resets the map. For proper production rate limiting,
// configure Cloudflare Edge Rate Limiting in the Cloudflare Dashboard.
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 3,
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
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'

  // Rate limiting check (désactivé en test : évite une pollution du compteur
  // en mémoire entre lancements successifs de la suite E2E)
  if (!isTest) {
    const rateLimitKey = getRateLimitKey(event)
    const rateCheck = checkRateLimit(rateLimitKey)
    if (!rateCheck.allowed) {
      throw createError({
        statusCode: 429,
        message: `Trop de requêtes. Réessayez dans ${rateCheck.resetIn} secondes.`
      })
    }
  }

  // Cloudflare Pages: read from process.env directly
  const firebaseProjectId = (process.env.NUXT_FIREBASE_PROJECT_ID || config.firebaseProjectId || '') as string
  const firebaseClientEmail = (process.env.NUXT_FIREBASE_CLIENT_EMAIL || config.firebaseClientEmail || '') as string
  const firebasePrivateKey = (process.env.NUXT_FIREBASE_PRIVATE_KEY || config.firebasePrivateKey || '') as string
  
  const prenom = assertString(body?.prenom, 80)
  const nom = assertString(body?.nom, 80)
  const ville = assertString(body?.ville, 120)
  const email = assertString(body?.email, 180).toLowerCase()
  const message = assertString(body?.message, 4000)
  const website = assertString(body?.website, 200)
  const source = assertString(body?.source, 200) || '/contact'
  const newsletter = Boolean(body?.newsletter)
  
  if (!prenom || !nom || !email || !message) {
    throw createError({ statusCode: 400, message: 'Champs obligatoires manquants.' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: 'Email invalide.' })
  }
  if (message.length < 10) {
    throw createError({ statusCode: 400, message: 'Message trop court.' })
  }
  if (website) {
    throw createError({ statusCode: 400, message: 'Envoi bloqué.' })
  }

  if (isTest) {
    const { setContact } = await import('../utils/firestore-mock.js')
    const id = crypto.randomUUID()
    setContact(id, {
      id, prenom, nom, ville, email, message, newsletter, source,
      status: 'new',
      createdAt: new Date().toISOString(),
    })
    return { ok: true }
  }

  if (!firebaseClientEmail || !firebasePrivateKey || !firebaseProjectId) {
    throw createError({ statusCode: 503, message: 'Configuration serveur contact incomplète.' })
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
  
    // Récupérer les emails de destination depuis settings (nouveau format
    // contactEmails[] ; repli sur l'ancien champ contactEmail string pour les
    // documents Firestore écrits avant l'introduction des emails multiples)
    let contactEmails = [process.env.CONTACT_EMAIL || 'contact@example.com']
    try {
      const settingsResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/settings/config`, {
        headers: { authorization: `Bearer ${accessToken}` },
      })
      if (settingsResponse.ok) {
        const settingsDoc = await settingsResponse.json()
        const multiField = settingsDoc.fields?.contactEmails?.arrayValue?.values
        const legacyField = settingsDoc.fields?.contactEmail?.stringValue
        if (multiField?.length) {
          contactEmails = multiField.map((v: any) => v.stringValue).filter(Boolean)
        } else if (legacyField) {
          contactEmails = [legacyField]
        }
      }
    } catch (e) {
      console.error('Could not fetch settings, using fallback:', e)
    }

    // Envoyer notification email via Resend (domaine par défaut onresend.com)
    const resendApiKey = process.env.NUXT_RESEND_API_KEY || ''

    if (resendApiKey && contactEmails.length) {
      const quotaLimit = getEmailQuotaLimit()
      const month = new Date().toISOString().slice(0, 7)
      let quotaCount = 0
      try {
        const quotaDoc = await getFirestoreDoc(firebaseProjectId, accessToken, 'settings', 'emailQuota')
        const quotaData = quotaDoc ? parseFirestoreDoc(quotaDoc) : null
        quotaCount = quotaData?.month === month ? (quotaData.count || 0) : 0
      } catch (e) {
        console.error('Could not read email quota, assuming 0:', e)
      }

      if (quotaCount >= quotaLimit) {
        console.warn(`Email quota reached (${quotaCount}/${quotaLimit} for ${month}) — skipping Resend, contact saved to Firestore only.`)
      } else {
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
            from: 'noreply@onresend.com',
            to: contactEmails,
            subject: `Nouveau contact : ${prenom} ${nom}`,
            html: emailHtml,
          }),
        })

        if (!resendResponse.ok) {
          const errorText = await resendResponse.text()
          console.error('Resend error:', errorText)
        } else {
          console.log('Resend success')
          try {
            await setFirestoreDoc(firebaseProjectId, accessToken, 'settings', 'emailQuota', {
              month,
              count: quotaCount + 1,
            })
          } catch (e) {
            console.error('Could not update email quota counter:', e)
          }
        }
      }
    }

    return { ok: true }
  } catch (err) {
    console.error('Contact API error:', err)
    throw createError({ statusCode: 500, message: err.message || 'Server Error' })
  }
})
