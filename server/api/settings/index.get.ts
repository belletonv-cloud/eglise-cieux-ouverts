import { getFirestoreConfig, getAccessToken, getFirestoreDoc, parseFirestoreDoc } from '../../utils/firebase'

// Normalise le champ email : accepte le nouveau format (contactEmails: string[])
// et l'ancien format legacy (contactEmail: string) pour les documents Firestore
// existants écrits avant l'introduction des emails multiples.
function normalizeContactEmails(data: Record<string, any> | null): string[] {
  if (data?.contactEmails?.length) return data.contactEmails
  if (data?.contactEmail) return [data.contactEmail]
  return [process.env.CONTACT_EMAIL || 'contact@example.com']
}

export default defineEventHandler(async (event) => {
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'

  if (isTest) {
    const { getSettings } = await import('../../utils/firestore-mock.js')
    const data = getSettings()
    return {
      contactEmails: normalizeContactEmails(data),
      hideEventsPageIfEmpty: data?.hideEventsPageIfEmpty === true,
    }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    return { contactEmails: normalizeContactEmails(null) }
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const doc = await getFirestoreDoc(config.projectId, accessToken, 'settings', 'config')
    const data = doc ? parseFirestoreDoc(doc) : null

    return {
      contactEmails: normalizeContactEmails(data),
      hideEventsPageIfEmpty: data?.hideEventsPageIfEmpty === true,
    }
  } catch (err: any) {
    console.error('Settings load error:', err)
    return { contactEmails: normalizeContactEmails(null) }
  }
})
