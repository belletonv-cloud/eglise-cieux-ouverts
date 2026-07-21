import { getFirestoreConfig, getAccessToken, getFirestoreDoc, parseFirestoreDoc } from '../utils/firebase'

export default defineEventHandler(async (event) => {
  // En mode test, sert le mock RAM — le menu réel de production ne doit
  // jamais être lu/écrit pendant un run de tests ou une session de dev mockée
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    const { getMenuMock } = await import('../utils/firestore-mock.js')
    return getMenuMock()
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }
  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const doc = await getFirestoreDoc(config.projectId, accessToken, 'settings', 'menu')
    if (!doc) return { menuItems: null, menuBgImage: '' }
    const data = parseFirestoreDoc(doc)
    return { menuItems: data?.menuItems || null, menuBgImage: data?.menuBgImage || '' }
  } catch (err: any) {
    throw createError({ statusCode: 500, message: `Erreur chargement menu: ${err.message || err}` })
  }
})
