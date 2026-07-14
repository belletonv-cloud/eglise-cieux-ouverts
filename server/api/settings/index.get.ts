import { getFirestoreConfig, getAccessToken, getFirestoreDoc, parseFirestoreDoc } from '../../utils/firebase'

export default defineEventHandler(async (event) => {
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'

  if (isTest) {
    const { getSettings } = await import('../../utils/firestore-mock.js')
    return getSettings()
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    return { contactEmail: process.env.CONTACT_EMAIL || 'contact@example.com' }
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const doc = await getFirestoreDoc(config.projectId, accessToken, 'settings', 'config')
    const data = doc ? parseFirestoreDoc(doc) : null

    return {
      contactEmail: data?.contactEmail || process.env.CONTACT_EMAIL || 'contact@example.com',
      hideEventsPageIfEmpty: data?.hideEventsPageIfEmpty === true,
    }
  } catch (err: any) {
    console.error('Settings load error:', err)
    return { contactEmail: process.env.CONTACT_EMAIL || 'contact@example.com' }
  }
})
