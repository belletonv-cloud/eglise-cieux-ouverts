import { getFirestoreConfig, getAccessToken, getFirestoreDoc, parseFirestoreDoc } from '../../utils/firebase'
import { requireAdmin } from '../../utils/firebase-admin'
import { getEmailQuotaLimit } from '../../utils/email-quota'

export default defineEventHandler(async (event) => {
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'

  if (isTest) {
    const { getEmailQuota } = await import('../../utils/firestore-mock.js')
    return { ...getEmailQuota(), limit: getEmailQuotaLimit() }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  await requireAdmin(event)

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const doc = await getFirestoreDoc(config.projectId, accessToken, 'settings', 'emailQuota')
    const data = doc ? parseFirestoreDoc(doc) : null

    return {
      month: data?.month || null,
      count: data?.count || 0,
      limit: getEmailQuotaLimit(),
    }
  } catch (err: any) {
    console.error('Email quota load error:', err)
    throw createError({ statusCode: 500, message: `Erreur: ${err.message || err}` })
  }
})
