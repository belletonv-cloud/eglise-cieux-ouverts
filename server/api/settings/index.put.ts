import { getFirestoreConfig, getAccessToken, setFirestoreDoc } from '../../utils/firebase'
import { requireAdmin } from '../../utils/firebase-admin'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Accepte soit un tableau (contactEmails), soit l'ancien format legacy
// (contactEmail: string) — normalise, dédoublonne et valide.
function parseContactEmails(body: any): string[] {
  const raw = Array.isArray(body?.contactEmails)
    ? body.contactEmails
    : typeof body?.contactEmails === 'string'
      ? body.contactEmails.split(/[,\n]/)
      : body?.contactEmail
        ? [body.contactEmail]
        : []

  const emails = [...new Set(
    raw.map((e: string) => String(e).trim().toLowerCase()).filter(Boolean)
  )] as string[]

  return emails
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  const contactEmails = parseContactEmails(body)

  if (contactEmails.length === 0) {
    throw createError({ statusCode: 400, message: 'Au moins un email de contact est requis' })
  }
  const invalid = contactEmails.find(e => !EMAIL_RE.test(e))
  if (invalid) {
    throw createError({ statusCode: 400, message: `Email invalide : ${invalid}` })
  }

  const hideEventsPageIfEmpty = body?.hideEventsPageIfEmpty === true // par défaut false (toujours visible)

  if (isTest) {
    const { setSettings } = await import('../../utils/firestore-mock.js')
    setSettings({ contactEmails, hideEventsPageIfEmpty })
    return { ok: true }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  await requireAdmin(event)

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    await setFirestoreDoc(config.projectId, accessToken, 'settings', 'config', {
      contactEmails: contactEmails,
      hideEventsPageIfEmpty: hideEventsPageIfEmpty,
      updatedAt: new Date().toISOString(),
    })
    return { ok: true }
  } catch (err: any) {
    console.error('Settings update error:', err)
    throw createError({ statusCode: 500, message: `Erreur: ${err.message || err}` })
  }
})
