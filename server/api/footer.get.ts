import { getFirestoreConfig, getAccessToken, getFirestoreDoc, parseFirestoreDoc } from '../utils/firebase'

export default defineEventHandler(async (event) => {
  // En mode test, sert le mock RAM — jamais la vraie base
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    const { getFooterMock } = await import('../utils/firestore-mock.js')
    return { props: getFooterMock() }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }
  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const doc = await getFirestoreDoc(config.projectId, accessToken, 'settings', 'footer')
    if (!doc) return { props: null }
    const data = parseFirestoreDoc(doc)
    return { props: data || null }
  } catch (err: any) {
    throw createError({ statusCode: 500, message: `Erreur chargement footer: ${err.message || err}` })
  }
})
